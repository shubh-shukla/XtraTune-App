import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { API_BASE } from "@/api/client";
import { BorderRadius, FontSize, Spacing, useTheme } from "@/theme";

interface LoginPromptOptions {
  title?: string;
  message?: string;
}

interface LoginPromptContextType {
  showLoginPrompt: (options?: LoginPromptOptions) => void;
}

const LoginPromptContext = createContext<LoginPromptContextType>({
  showLoginPrompt: () => {},
});

export function LoginPromptProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<LoginPromptOptions>({});
  const overlay = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  const showLoginPrompt = useCallback((options?: LoginPromptOptions) => {
    setOpts(options ?? {});
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlay, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [overlay, scale]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlay, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, overlay, scale]);

  const handleLogin = useCallback(() => {
    overlay.setValue(0);
    scale.setValue(0.9);
    setVisible(false);
    const url = `${API_BASE}/auth/signin?callbackUrl=${encodeURIComponent(
      `${API_BASE}/`
    )}`;
    WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    }).catch(() => {});
  }, [overlay, scale]);

  return (
    <LoginPromptContext.Provider value={{ showLoginPrompt }}>
      {children}
      {visible && (
        <Modal
          transparent
          visible
          animationType="none"
          onRequestClose={close}
        >
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlay,
              backgroundColor: colors.overlay,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: colors.surfaceElevated,
                transform: [{ scale }],
              },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Ionicons name="heart" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {opts.title ?? "Sign in required"}
            </Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {opts.message ??
                "Log in to save your favorites and sync them across devices."}
            </Text>
            <View style={styles.actions}>
              <Pressable
                onPress={close}
                style={({ pressed }) => [
                  styles.button,
                  styles.secondaryBtn,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.btnText, { color: colors.text }]}>
                  Cancel
                </Text>
              </Pressable>
              <View style={{ width: Spacing.md }} />
              <Pressable
                onPress={handleLogin}
                style={({ pressed }) => [
                  styles.button,
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Ionicons
                  name="log-in-outline"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.btnText, { color: "#fff" }]}>Log in</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
        </Modal>
      )}
    </LoginPromptContext.Provider>
  );
}

export function useLoginPrompt() {
  return useContext(LoginPromptContext);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "86%",
    maxWidth: 360,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.md,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  actions: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    height: 46,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
  },
  secondaryBtn: {
    borderWidth: 1,
  },
  primaryBtn: {},
  btnText: {
    fontSize: FontSize.md,
    fontWeight: "600",
  },
});
