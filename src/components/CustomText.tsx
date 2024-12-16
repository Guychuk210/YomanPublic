import React from 'react';
import { Text, TextProps } from 'react-native';
import { theme } from '../styles/theme';

interface CustomTextProps extends TextProps {
  bold?: boolean;
  semiBold?: boolean;
  light?: boolean;
  italic?: boolean;
}

export const CustomText: React.FC<CustomTextProps> = ({ 
  style, 
  bold,
  semiBold,
  light,
  italic,
  ...props 
}) => {
  let fontFamily = theme.fonts.medium; // default font

  if (bold) fontFamily = theme.fonts.bold;
  if (semiBold) fontFamily = theme.fonts.semiBold;
  if (light) fontFamily = theme.fonts.light;
  if (italic) fontFamily = theme.fonts.italic;

  return (
    <Text 
      style={[{ fontFamily }, style]} 
      {...props} 
    />
  );
}; 