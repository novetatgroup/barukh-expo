import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface FooterLinkProps {
  text: string;
  linkText: string;
  onLinkPress: () => void;
}

const FooterLink: React.FC<FooterLinkProps> = ({ 
  text, 
  linkText, 
  onLinkPress 
}) => {
    
  return (
    <Text style={styles.footerText}>
      {text}{' '}
      <Text style={styles.link} onPress={onLinkPress}>
        {linkText}
      </Text>
    </Text>
  );
};

const styles = StyleSheet.create({
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  link: {
    color: '#0b3d2e',
    fontWeight: '600',
  },
});

export default FooterLink;
