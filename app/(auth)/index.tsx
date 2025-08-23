import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <View>
      <View>
        <Text>
          {activeTab === "login" ? "Welcome Back" : "Let's Get Started"}
        </Text>
        <Text>Log in to continue your journey.</Text>
      </View>

      <View>
        <View>
          <Pressable
            onPress={() => setActiveTab("login")}
            // style={[styles.tab, activeTab === "login" && styles.activeTab]}
          >
            <Text>Login</Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("register")}
            //style={[styles.tab, activeTab === "register" && styles.activeTab]}
          >
            <Text>Register</Text>
          </Pressable>
        </View>

        {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
      </View>
    </View>
  );
}

// Add your form components
function LoginForm() {
  return (
    <View>
      <Text>Login Form</Text>
    </View>
  );
}

function RegisterForm() {
  return (
    <View>
      <Text>Register Form</Text>
    </View>
  );
}

/* const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flex: 1, backgroundColor: "green" },
  title: { color: "white", fontSize: 24 },
  subtitle: { color: "white" },
  formContainer: { flex: 2, backgroundColor: "white" },
  tabHeader: { flexDirection: "row" },
  tab: { flex: 1, padding: 16 },
  activeTab: { borderBottomWidth: 2 },
}); */
