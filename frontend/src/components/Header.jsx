import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS } from '../config/fonts.js';
import { colors } from '../styles/colors.js';

export function Header({ title = "WealthWise." }) {
    return (
        <View style={styles.container}>
            <View style={styles.profilePicture} />
            <Text style={styles.title}>{title}</Text>
            <View style={styles.spacer} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: colors.light,
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.grey.medium,
    },
    title: {
        flex: 1,
        fontFamily: FONTS.crushed,
        fontSize: 24,
        color: colors.primary,
        textAlign: 'center',
    },
    spacer: {
        width: 40, // Same width as profile picture to center the title
    },
});