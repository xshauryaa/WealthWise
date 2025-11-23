import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { FONTS } from '../config/fonts.js';
import { colors } from '../styles/colors.js';
import { padding } from '../styles/spacing.js';

const { width } = Dimensions.get('window');

export function Header({ 
    title = "WealthWise.", 
    showBackButton = false, 
    onBackPress = null 
}) {
    return (
        <View style={styles.container}>
            {showBackButton ? (
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={onBackPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>
            ) : (
                <View style={{ ...styles.profilePicture, backgroundColor: '#FFF'}} />
            )}
            
            <Text style={styles.title}>{title}</Text>
            
            <View style={styles.profilePicture} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: width - padding.SCREEN_PADDING * 2,
        flexDirection: 'row',
        alignItems: 'stretch',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: colors.light,
        alignSelf: 'center'
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.grey.medium,
        alignSelf: 'flex-end',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backArrow: {
        fontSize: 24,
        color: colors.light,
        fontWeight: 'bold',
        marginTop: -2,
    },
    title: {
        flex: 1,
        fontFamily: FONTS.crushed,
        fontSize: 32,
        color: colors.primary,
        textAlign: 'center',
        alignSelf: 'center',
    },
    spacer: {
        width: 40, // Same width as profile picture to center the title
    },
});