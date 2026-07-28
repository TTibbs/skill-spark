import React from "react";
import {
  useCssElement,
} from "react-native-css";
import {
  ActivityIndicator as RNActivityIndicator,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Platform,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  View as RNView,
} from "react-native";

type CssMapping = Record<string, string>;
type CssElement = <Props>(
  component: React.ComponentType<Props>,
  props: Props,
  mapping: CssMapping
) => React.ReactElement;

const cssElement = useCssElement as unknown as CssElement;

export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};

export function View(props: ViewProps) {
  return cssElement(RNView, props, { className: "style" });
}

export type TextProps = React.ComponentProps<typeof RNText> & {
  className?: string;
};

export function Text(props: TextProps) {
  return cssElement(RNText, props, { className: "style" });
}

export type PressableProps = React.ComponentProps<typeof RNPressable> & {
  className?: string;
};

export function Pressable(props: PressableProps) {
  return cssElement(RNPressable, props, {
    className: "style",
  });
}

export type ScrollViewProps = React.ComponentProps<typeof RNScrollView> & {
  className?: string;
  contentContainerClassName?: string;
};

export function ScrollView(props: ScrollViewProps) {
  return cssElement(RNScrollView, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
}

export type TextInputProps = React.ComponentProps<typeof RNTextInput> & {
  className?: string;
};

export function TextInput(props: TextInputProps) {
  return cssElement(RNTextInput, props, { className: "style" });
}

export type KeyboardAvoidingViewProps = React.ComponentProps<
  typeof RNKeyboardAvoidingView
> & {
  className?: string;
};

export function KeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
  return cssElement(RNKeyboardAvoidingView, props, { className: "style" });
}

export function ScreenKeyboardView({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className={className}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

export const ActivityIndicator = RNActivityIndicator;
