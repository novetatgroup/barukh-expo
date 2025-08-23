import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import LoginForm from "../components/forms/LoginForm";
import RegisterForm from "../components/forms/RegisterForm";

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <View>
      <View>
        <Text>
          {activeTab === "login" ? "Welcome Back" : "Let's Get Started"}
        </Text>
        <Text>
          {activeTab === "login"
            ? "Log in to continue your journey"
            : "Sign up to start your journey"}{" "}
          .
        </Text>
      </View>

      <View>
        <View>
          <Pressable onPress={() => setActiveTab("login")}>
            <Text>Login</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab("register")}>
            <Text>Register</Text>
          </Pressable>
        </View>

        {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
      </View>
    </View>
  );
}
