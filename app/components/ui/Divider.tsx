import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DividerProps {
  text?: string;
  color?: string;
}

const Divider: React.FC<DividerProps> = ({ 
  text = 'Or', 
  color = '#E5E5E5'
   
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: color }]} />
      <Text style={styles.text}>{text}</Text>
      <View style={[styles.line, { backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
  },
  text: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
});

export default Divider;