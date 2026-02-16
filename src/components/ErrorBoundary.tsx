import React, {Component, ErrorInfo, ReactNode} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import {AlertTriangle, RotateCcw, ChevronDown, ChevronUp} from 'lucide-react-native';
import {colors, spacing, layout, textStyles} from '@theme';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private fadeAnim = new Animated.Value(0);

  constructor(props: Props) {
    super(props);
    this.state = {hasError: false, error: null, showDetails: false};
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO: send to Sentry / Crashlytics
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (this.state.hasError && !prevState.hasError) {
      Animated.timing(this.fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();

      AccessibilityInfo.announceForAccessibility(
        'An unexpected error occurred. You can try again or view error details.',
      );
    }
  }

  handleReset = () => {
    this.fadeAnim.setValue(0);
    this.setState({hasError: false, error: null, showDetails: false});
    this.props.onReset?.();
  };

  toggleDetails = () => {
    this.setState(prev => ({showDetails: !prev.showDetails}));
  };

  render() {
    if (this.state.hasError) {
      const {error, showDetails} = this.state;
      const DetailChevron = showDetails ? ChevronUp : ChevronDown;

      return (
        <Animated.View
          style={[styles.container, {opacity: this.fadeAnim}]}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive">
          <View style={styles.iconCircle}>
            <AlertTriangle
              size={32}
              color={colors.error}
              strokeWidth={1.8}
            />
          </View>

          <Text style={styles.title}>Something went wrong</Text>

          <Text style={styles.message}>
            The app ran into an unexpected problem.{'\n'}
            Your data is safe — try restarting to get back on track.
          </Text>

          <Pressable
            style={({pressed}) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={this.handleReset}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            accessibilityHint="Attempts to recover the app by restarting">
            <RotateCcw size={16} color={colors.textInverse} strokeWidth={2.2} />
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>

          {error && (
            <View style={styles.detailsSection}>
              <Pressable
                style={styles.detailsToggle}
                onPress={this.toggleDetails}
                accessibilityRole="button"
                accessibilityLabel={
                  showDetails ? 'Hide error details' : 'Show error details'
                }
                accessibilityState={{expanded: showDetails}}>
                <Text style={styles.detailsToggleText}>
                  {showDetails ? 'Hide details' : 'What happened?'}
                </Text>
                <DetailChevron
                  size={14}
                  color={colors.textTertiary}
                  strokeWidth={2}
                />
              </Pressable>

              {showDetails && (
                <View style={styles.detailsCard}>
                  <Text style={styles.errorName}>{error.name}</Text>
                  <Text style={styles.errorMessage} selectable>
                    {error.message}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    backgroundColor: colors.background,
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    borderRadius: layout.cardRadius,
    minWidth: 180,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryButtonPressed: {
    opacity: 0.85,
    transform: [{scale: 0.98}],
  },
  primaryButtonText: {
    ...textStyles.button,
    color: colors.textInverse,
  },

  detailsSection: {
    width: '100%',
    marginTop: spacing.xxxl,
    alignItems: 'center',
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  detailsToggleText: {
    ...textStyles.bodySmall,
    color: colors.textTertiary,
  },
  detailsCard: {
    width: '100%',
    marginTop: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: layout.buttonRadius,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
  },
  errorName: {
    ...textStyles.label,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  errorMessage: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
  },
});
