import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Spacing, FontSize, BorderRadius } from "@/theme";
import { API_BASE } from "@/api/client";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleOAuth = async (provider: "github" | "google") => {
    try {
      setLoading(true);
      const url = `${API_BASE}/auth/signin?provider=${provider}&callbackUrl=${encodeURIComponent(
        `${API_BASE}/`
      )}`;
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      });
    } catch (err) {
      Alert.alert("Error", "Could not open the login page.");
    } finally {
      setLoading(false);
    }
  };

  const openWebSignin = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE}/auth/signin?callbackUrl=${encodeURIComponent(
        `${API_BASE}/`
      )}`;
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      });
    } catch (err) {
      Alert.alert("Error", "Could not open the login page.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Close button */}
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 10 }]}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <Ionicons name="close" size={26} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: colors.primary + "22" },
            ]}
          >
            <Ionicons name="musical-notes" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.brand, { color: colors.text }]}>XtraTune</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to sync your favorites,{"\n"}playlists and preferences
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <View style={styles.buttonGroup}>
            {/* GitHub */}
            <TouchableOpacity
              onPress={() => handleOAuth("github")}
              style={[styles.oauthBtn, { backgroundColor: "#24292e" }]}
            >
              <Ionicons name="logo-github" size={22} color="#fff" />
              <Text style={styles.oauthBtnText}>Continue with GitHub</Text>
            </TouchableOpacity>

            {/* Google */}
            <TouchableOpacity
              onPress={() => handleOAuth("google")}
              style={[
                styles.oauthBtn,
                {
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="logo-google" size={22} color="#4285F4" />
              <Text style={[styles.oauthBtnText, { color: colors.text }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.terms, { color: colors.textSecondary }]}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: {
    position: "absolute",
    top: 54,
    right: Spacing.lg,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  logoBox: { alignItems: "center", marginBottom: 48 },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  brand: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: {
    fontSize: FontSize.base,
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  buttonGroup: { width: "100%", gap: Spacing.md },
  oauthBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  oauthBtnText: {
    color: "#fff",
    fontSize: FontSize.base,
    fontWeight: "600",
  },
  terms: {
    fontSize: FontSize.xs,
    textAlign: "center",
    marginTop: 32,
    lineHeight: 18,
  },
});
