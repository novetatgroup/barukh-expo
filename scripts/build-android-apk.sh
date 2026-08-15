#!/usr/bin/env bash
#
# Build a distributable Android APK locally using expo prebuild + Gradle.
# The release APK is signed with the standard Android debug keystore so it
# installs on any device but is NOT publishable to the Play Store.
#
# Usage:
#   bash scripts/build-android-apk.sh              # release APK
#   bash scripts/build-android-apk.sh --debug      # debug APK
#   bash scripts/build-android-apk.sh --skip-prebuild
#   bash scripts/build-android-apk.sh --help
#
set -euo pipefail

# --- args -------------------------------------------------------------------

BUILD_TYPE="release"
SKIP_PREBUILD=0

usage() {
  cat <<EOF
Build a distributable Android APK.

Options:
  --debug           Build assembleDebug (default: assembleRelease)
  --skip-prebuild   Skip 'npx expo prebuild' (useful when iterating on gradle)
  -h, --help        Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --debug)         BUILD_TYPE="debug"; shift ;;
    --skip-prebuild) SKIP_PREBUILD=1; shift ;;
    -h|--help)       usage; exit 0 ;;
    *)               echo "Unknown flag: $1" >&2; usage; exit 1 ;;
  esac
done

# --- pretty logging ---------------------------------------------------------

CURRENT_STEP="init"
step() { CURRENT_STEP="$1"; echo; echo "==> $1"; }
info() { echo "    $1"; }
fail() { echo; echo "!! Failed during step: $CURRENT_STEP" >&2; }
trap fail ERR

# --- step 1: prerequisites --------------------------------------------------

step "Checking prerequisites"

command -v node >/dev/null || { echo "node is not installed" >&2; exit 1; }
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
[[ "$NODE_MAJOR" -ge 18 ]] || { echo "Node.js >= 18 required (found $(node --version))" >&2; exit 1; }
info "node $(node --version)"

command -v npx >/dev/null || { echo "npx is not installed" >&2; exit 1; }

command -v java >/dev/null || { echo "java is not installed. Install JDK 17 (e.g. 'brew install --cask temurin@17')." >&2; exit 1; }
JAVA_MAJOR=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | awk -F '.' '{print ($1=="1" ? $2 : $1)}')
if [[ "$JAVA_MAJOR" != "17" ]]; then
  cat >&2 <<EOF
JDK 17 required (found version ${JAVA_MAJOR:-unknown}). Expo SDK 54 / RN 0.81 uses Gradle 8.14.3.
If JDK 17 is installed with SDKMAN, run:
  sdk default java 17.0.19-tem
Then open a new shell and retry.
EOF
  exit 1
fi
info "java $JAVA_MAJOR"

ANDROID_SDK=""
if [[ -n "${ANDROID_HOME:-}" && -d "$ANDROID_HOME" ]]; then
  ANDROID_SDK="$ANDROID_HOME"
elif [[ -n "${ANDROID_SDK_ROOT:-}" && -d "$ANDROID_SDK_ROOT" ]]; then
  ANDROID_SDK="$ANDROID_SDK_ROOT"
elif [[ "$(uname -s)" == "Darwin" && -d "$HOME/Library/Android/sdk" ]]; then
  ANDROID_SDK="$HOME/Library/Android/sdk"
fi

if [[ -z "$ANDROID_SDK" ]]; then
  cat >&2 <<EOF
Android SDK was not found through ANDROID_HOME, ANDROID_SDK_ROOT, or the standard macOS location.
Install Android SDK:
  macOS:  brew install --cask android-commandlinetools
          then set: export ANDROID_HOME="\$HOME/Library/Android/sdk"
  Linux:  https://developer.android.com/tools/sdkmanager
EOF
  exit 1
fi

export ANDROID_HOME="$ANDROID_SDK"
export ANDROID_SDK_ROOT="$ANDROID_SDK"
export PATH="$ANDROID_SDK/platform-tools:$ANDROID_SDK/cmdline-tools/latest/bin:$PATH"
info "Android SDK: $ANDROID_SDK"

REQUIRED_SDK_PACKAGES=(
  "platforms;android-36|platforms/android-36"
  "build-tools;36.0.0|build-tools/36.0.0"
  "ndk;27.1.12297006|ndk/27.1.12297006"
  "platform-tools|platform-tools"
)
MISSING_SDK_PACKAGES=()

for package_entry in "${REQUIRED_SDK_PACKAGES[@]}"; do
  package_name="${package_entry%%|*}"
  package_path="${package_entry#*|}"
  if [[ ! -d "$ANDROID_SDK/$package_path" ]]; then
    MISSING_SDK_PACKAGES+=("$package_name")
  fi
done

if [[ ${#MISSING_SDK_PACKAGES[@]} -gt 0 ]]; then
  SDKMANAGER="$ANDROID_SDK/cmdline-tools/latest/bin/sdkmanager"
  if [[ ! -x "$SDKMANAGER" ]]; then
    SDKMANAGER=$(command -v sdkmanager || true)
  fi
  [[ -n "$SDKMANAGER" && -x "$SDKMANAGER" ]] || {
    echo "sdkmanager is required to install missing Android SDK packages: ${MISSING_SDK_PACKAGES[*]}" >&2
    exit 1
  }

  info "Installing missing SDK packages: ${MISSING_SDK_PACKAGES[*]}"
  "$SDKMANAGER" --sdk_root="$ANDROID_SDK" "${MISSING_SDK_PACKAGES[@]}"

  for package_entry in "${REQUIRED_SDK_PACKAGES[@]}"; do
    package_name="${package_entry%%|*}"
    package_path="${package_entry#*|}"
    [[ -d "$ANDROID_SDK/$package_path" ]] || {
      echo "Android SDK package installation did not create $package_name at $ANDROID_SDK/$package_path" >&2
      exit 1
    }
  done
else
  info "Required Android SDK packages are installed."
fi

REPO_ROOT="$(pwd)"
[[ -f "$REPO_ROOT/package.json" ]] || { echo "Run this script from the repo root." >&2; exit 1; }
grep -q '"expo"' "$REPO_ROOT/package.json" || { echo "package.json doesn't look like an Expo project." >&2; exit 1; }

# --- step 2: debug keystore -------------------------------------------------

step "Ensuring debug keystore exists"

KEYSTORE="$HOME/.android/debug.keystore"
if [[ ! -f "$KEYSTORE" ]]; then
  info "Creating $KEYSTORE"
  mkdir -p "$HOME/.android"
  keytool -genkey -v \
    -keystore "$KEYSTORE" \
    -storepass android \
    -alias androiddebugkey \
    -keypass android \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US" >/dev/null 2>&1
  info "Created."
else
  info "Found existing keystore."
fi

# --- step 3: JS deps --------------------------------------------------------

step "Installing JS dependencies (npm install)"
npm install --no-audit --no-fund

# --- step 4: prebuild -------------------------------------------------------

if [[ $SKIP_PREBUILD -eq 0 ]]; then
  step "Prebuilding native Android project"
  npx expo prebuild --platform android --clean --no-install
else
  step "Skipping prebuild (--skip-prebuild)"
  [[ -d "$REPO_ROOT/android" ]] || { echo "android/ folder missing; cannot skip prebuild on a clean tree." >&2; exit 1; }
fi

# --- step 5: verify release signing config ---------------------------------

if [[ "$BUILD_TYPE" == "release" ]]; then
  step "Verifying release signing config"
  BUILD_GRADLE="$REPO_ROOT/android/app/build.gradle"
  [[ -f "$BUILD_GRADLE" ]] || { echo "android/app/build.gradle not found after prebuild." >&2; exit 1; }

  # If the release buildType has no signingConfig line, inject the debug one.
  # Idempotent: only patches when the line is missing.
  if ! awk '
    /buildTypes[[:space:]]*\{/,/^\}/ {
      if (/release[[:space:]]*\{/) in_release=1
      if (in_release && /signingConfig/) { has_signing=1 }
      if (in_release && /^[[:space:]]*\}[[:space:]]*$/) in_release=0
    }
    END { exit has_signing ? 0 : 1 }
  ' "$BUILD_GRADLE"; then
    info "Injecting 'signingConfig signingConfigs.debug' into release buildType"
    # Insert one line after "release {" inside buildTypes
    awk '
      { print }
      /buildTypes[[:space:]]*\{/ { in_bt=1 }
      in_bt && /release[[:space:]]*\{/ && !done {
        print "            signingConfig signingConfigs.debug"
        done=1
      }
    ' "$BUILD_GRADLE" > "$BUILD_GRADLE.tmp" && mv "$BUILD_GRADLE.tmp" "$BUILD_GRADLE"
  else
    info "signingConfig already configured."
  fi
fi

# --- step 6: assemble -------------------------------------------------------

GRADLE_TASK="assembleRelease"
[[ "$BUILD_TYPE" == "debug" ]] && GRADLE_TASK="assembleDebug"

step "Assembling APK ($GRADLE_TASK)"
(
  cd "$REPO_ROOT/android"
  ./gradlew clean "$GRADLE_TASK" --no-daemon --stacktrace
)

# --- step 7: copy output ----------------------------------------------------

step "Locating APK"

APK_SRC="$REPO_ROOT/android/app/build/outputs/apk/$BUILD_TYPE/app-$BUILD_TYPE.apk"
[[ -f "$APK_SRC" ]] || { echo "Expected APK not found at $APK_SRC" >&2; exit 1; }

APP_VERSION=$(node -p "require('./app.json').expo.version" 2>/dev/null || echo "unknown")
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT_DIR="$REPO_ROOT/build"
OUTPUT_APK="$OUTPUT_DIR/barukh-expo-${APP_VERSION}-${BUILD_TYPE}-${TIMESTAMP}.apk"

mkdir -p "$OUTPUT_DIR"
cp "$APK_SRC" "$OUTPUT_APK"

# --- step 8: summary --------------------------------------------------------

step "Done"

APK_SIZE=$(du -h "$OUTPUT_APK" | cut -f1)
cat <<EOF

  APK:     $OUTPUT_APK
  Size:    $APK_SIZE
  Version: $APP_VERSION
  Type:    $BUILD_TYPE (signed with debug keystore)

  Install on a connected device:
    adb install "$OUTPUT_APK"

EOF
