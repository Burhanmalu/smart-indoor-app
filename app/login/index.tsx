// ==========================================
// Login Screen — Auth with Remember Me Box & Role Selector
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores';
import { useTheme } from '../../src/hooks/useTheme';
import { UserRole } from '../../src/models/types';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState('admin@envirosync.in');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');

  const handleLogin = () => {
    setUser(
      {
        id: `usr_${Date.now()}`,
        name:
          selectedRole === 'ADMIN'
            ? 'Dr. Rajesh Sharma (Admin)'
            : selectedRole === 'FACILITY_MANAGER'
            ? 'Priya Patel (Facility Lead)'
            : 'Rahul Verma (Faculty)',
        email: email || 'user@envirosync.in',
        role: selectedRole,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      'envirosync_jwt_access_token_2026',
      rememberMe
    );
    router.replace('/(tabs)');
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'ADMIN') {
      setEmail('admin@envirosync.in');
      setPassword('Admin@123456');
    } else if (role === 'FACILITY_MANAGER') {
      setEmail('manager@envirosync.in');
      setPassword('Manager@123456');
    } else {
      setEmail('user@envirosync.in');
      setPassword('User@123456');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDark ? 'transparent' : theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.borderLight,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={isDark ? 'weather-night' : 'white-balance-sunny'}
              size={20}
              color={isDark ? '#FFD60A' : '#FF9500'}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.logoBadge,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.borderLight,
              },
            ]}
          >
            <Image
              source={require('../../assets/EnviroSync_logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>EnviroSync AI</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Sign in to access real-time indoor monitoring & automated comfort control
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.borderLight,
            },
          ]}
        >
          {/* Email Input */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>EMAIL ADDRESS</Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={theme.colors.textTertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="admin@envirosync.io"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 14 }]}>
            PASSWORD
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={theme.colors.textTertiary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textTertiary}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {/* Remember Me & Forgot Password Row */}
          <View style={styles.rememberRow}>
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.rememberBtn}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={22}
                color={rememberMe ? theme.colors.primary : theme.colors.textTertiary}
              />
              <Text
                style={[
                  styles.rememberText,
                  { color: rememberMe ? theme.colors.text : theme.colors.textSecondary },
                ]}
              >
                Remember me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[styles.forgotText, { color: theme.colors.primary }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Role Quick Selector */}
          <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 16 }]}>
            SELECT LOGIN ROLE
          </Text>
          <View style={styles.roleRow}>
            {(['ADMIN', 'FACILITY_MANAGER', 'OCCUPANT'] as UserRole[]).map((role) => {
              const isSelected = selectedRole === role;
              return (
                <TouchableOpacity
                  key={role}
                  onPress={() => handleRoleSelect(role)}
                  style={[
                    styles.roleChip,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.inputBackground,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      { color: isSelected ? '#FFF' : theme.colors.textSecondary },
                    ]}
                  >
                    {role === 'ADMIN' ? 'Admin' : role === 'FACILITY_MANAGER' ? 'Manager' : 'Occupant'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleLogin}
            style={[styles.loginBtn, { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>Sign In</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* Quick Demo Button */}
          <TouchableOpacity
            onPress={handleLogin}
            style={[styles.quickDemoBtn, { borderColor: theme.colors.primary }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.quickDemoText, { color: theme.colors.primary }]}>
              Instant Demo Access (Skip)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            EnviroSync AI Autonomous Building Engine v1.0
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  themeToggleBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoBadge: {
    width: 90,
    height: 90,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  card: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 4,
  },
  rememberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  loginBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  quickDemoBtn: {
    height: 46,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickDemoText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
  },
});
