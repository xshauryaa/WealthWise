import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import ParsedText from 'react-native-parsed-text';
import { colors } from '../styles/colors';

const MarkdownText = ({ children, style, isAssistant = false }) => {
  const baseTextColor = isAssistant ? colors.light : colors.dark;

  const parsePatterns = [
    // Bold text **text**
    {
      pattern: /\*\*([^*]+)\*\*/g,
      style: [styles.bold, { color: baseTextColor }],
      renderText: (matchingString) => {
        return matchingString.replace(/\*\*/g, '');
      }
    },
    // Italic text *text*
    {
      pattern: /\*([^*]+)\*/g,
      style: [styles.italic, { color: baseTextColor }],
      renderText: (matchingString) => {
        return matchingString.replace(/\*/g, '');
      }
    },
    // Inline code `text`
    {
      pattern: /`([^`]+)`/g,
      style: [styles.inlineCode, { 
        backgroundColor: isAssistant ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
        color: baseTextColor 
      }],
      renderText: (matchingString) => {
        return matchingString.replace(/`/g, '');
      }
    },
    // Headers ### text
    {
      pattern: /^### (.+)$/gm,
      style: [styles.h3, { color: baseTextColor }],
      renderText: (matchingString) => {
        return matchingString.replace(/^### /, '');
      }
    },
    // Headers ## text
    {
      pattern: /^## (.+)$/gm,
      style: [styles.h2, { color: baseTextColor }],
      renderText: (matchingString) => {
        return matchingString.replace(/^## /, '');
      }
    }
  ];

  // Split content by lines to handle formatting better
  const processContent = (content) => {
    const lines = content.split('\n');
    const processedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        processedLines.push(
          <View key={i} style={styles.bulletContainer}>
            <Text style={[styles.bullet, { color: baseTextColor }]}>• </Text>
            <ParsedText
              style={[styles.bulletText, style, { color: baseTextColor }]}
              parse={parsePatterns}
            >
              {line.replace(/^[-•]\s*/, '')}
            </ParsedText>
          </View>
        );
      }
      // Handle numbered lists
      else if (/^\d+\.\s/.test(line.trim())) {
        const number = line.trim().match(/^(\d+)\./)[1];
        processedLines.push(
          <View key={i} style={styles.bulletContainer}>
            <Text style={[styles.bullet, { color: baseTextColor }]}>{number}. </Text>
            <ParsedText
              style={[styles.bulletText, style, { color: baseTextColor }]}
              parse={parsePatterns}
            >
              {line.replace(/^\d+\.\s*/, '')}
            </ParsedText>
          </View>
        );
      }
      // Handle code blocks ```
      else if (line.trim().startsWith('```')) {
        // Find the end of code block
        const codeLines = [line.replace(/```\w*/, '')]; // Remove language identifier
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith('```')) {
          codeLines.push(lines[j]);
          j++;
        }
        if (j < lines.length) {
          i = j; // Skip to end of code block
        }
        
        processedLines.push(
          <View key={i} style={[styles.codeBlock, { 
            backgroundColor: isAssistant ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' 
          }]}>
            <Text style={[styles.codeText, { color: baseTextColor }]}>
              {codeLines.join('\n').trim()}
            </Text>
          </View>
        );
      }
      // Regular text with markdown parsing
      else if (line.trim() !== '') {
        processedLines.push(
          <ParsedText
            key={i}
            style={[styles.regularText, style, { color: baseTextColor }]}
            parse={parsePatterns}
          >
            {line}
          </ParsedText>
        );
      }
      // Empty line for spacing
      else {
        processedLines.push(<View key={i} style={styles.spacing} />);
      }
    }

    return processedLines;
  };

  return (
    <View>
      {processContent(children)}
    </View>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: '700',
    fontFamily: 'AlbertSans_700Bold',
  },
  italic: {
    fontStyle: 'italic',
    fontFamily: 'AlbertSans_400Regular_Italic',
  },
  h2: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'AlbertSans_700Bold',
    marginVertical: 8,
    lineHeight: 24,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'AlbertSans_600SemiBold',
    marginVertical: 6,
    lineHeight: 22,
  },
  regularText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 4,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'AlbertSans_400Regular',
  },
  inlineCode: {
    fontFamily: 'Courier',
    fontSize: 15,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeBlock: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  codeText: {
    fontFamily: 'Courier',
    fontSize: 14,
    lineHeight: 20,
  },
  spacing: {
    height: 8,
  },
});

export default MarkdownText;
