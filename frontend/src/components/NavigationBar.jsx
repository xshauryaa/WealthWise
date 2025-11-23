import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Home from '../../assets/nav-icons/Home.svg';
import Budget from '../../assets/nav-icons/Budget.svg';
import Learning from '../../assets/nav-icons/Learning.svg';
import Microinvest from '../../assets/nav-icons/Microinvest.svg';
import Profile from '../../assets/nav-icons/Profile.svg';
import Indicator from '../../assets/nav-icons/Indicator.svg';
import { colors } from '../styles/colors.js';
import { spacing, padding } from '../styles/spacing.js';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const BAR_HEIGHT = (width > 400) ? 72 : (width > 380) ? 64 : 56; // 64px for 430px width screen
const INDICATOR_OFFSET = (width > 400) ? 10 : (width > 380) ? 8 : 6;
const INDICATOR_DIM = 3 * BAR_HEIGHT / 4;
const ICON_DIM = INDICATOR_DIM / 2;
const PADDING_HORIZONTAL = 5/6 * ICON_DIM;
const OFFSET = (BAR_HEIGHT - INDICATOR_DIM) / 2;
const WIDTH = width - padding.SCREEN_PADDING * 2;

const NavigationBar = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();

    const ICONS = {
        Home: Home,
        Budget: Budget,
        LearningStack: Learning,
        Microinvest: Microinvest,
        Profile: Profile
    };

    const indicatorX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const index = state.index;
        const GAP = (WIDTH - (2 * PADDING_HORIZONTAL) - (5 * ICON_DIM)) / 4;
        const xPosition = index * (GAP + ICON_DIM) + OFFSET;
        Animated.spring(indicatorX, {
            toValue: xPosition,
            useNativeDriver: true,
        }).start();
    }, [state.index]);

    return (
        <View
            style={{
                backgroundColor: '#FFFFFF',
                paddingBottom: insets.bottom,
                paddingTop: 40,
                height: BAR_HEIGHT + insets.bottom,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <View style={styles.bar}>
                <Animated.View
                    style={[
                        styles.indicator,
                        { transform: [{ translateX: indicatorX }], },
                    ]}
                >
                    <Indicator width={INDICATOR_DIM} height={INDICATOR_DIM} color={'white'} />
                </Animated.View>
                {state.routes.map((route, index) => {
                    const isActive = state.index === index;
                    const Icon = ICONS[route.name];
                    
                    // Skip if no icon found for this route
                    if (!Icon) {
                        console.warn(`No icon found for route: ${route.name}`);
                        return null;
                    }

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => navigation.navigate(route.name)}
                        >
                            <Icon width={ICON_DIM} height={ICON_DIM} color={isActive ? colors.primary : '#FFF'} />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    bar: {
        width: WIDTH,
        height: BAR_HEIGHT,
        borderRadius: 64,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        padding: PADDING_HORIZONTAL,
    },
    indicator: {
        position: 'absolute',
        top: INDICATOR_OFFSET,
        left: 0,
        zIndex: -1,
    },
})

export default NavigationBar