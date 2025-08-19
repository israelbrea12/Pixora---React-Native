import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getActivities, UserActivity } from '../services/DatabaseManager';
import { ActivityScreenProps } from '../navigation/types';
import i18n from '../i18n/LocalizationManager';

const ActivityItem = ({ item }: { item: UserActivity }) => {
    const date = new Date(item.timestamp);
    const formattedDate = `${date.toLocaleDateString()} a las ${date.toLocaleTimeString()}`;

    let activityText = '';
    if (item.type === 'LIKE') {
        activityText = i18n.t('activityLiked');
    } else if (item.type === 'ADD_TO_LIST') {
        activityText = i18n.t('activityAddedToList', { listName: item.listName });
    }

    return (
        <View style={styles.itemContainer}>
            <Image source={{ uri: item.photo.urls.thumb }} style={styles.thumbnail} />
            <View style={styles.textContainer}>
                <Text style={styles.activityText}>{activityText}</Text>
                <Text style={styles.timestamp}>{formattedDate}</Text>
            </View>
        </View>
    );
};

interface State {
    activities: UserActivity[];
    isLoading: boolean;
}

export default class ActivityScreen extends Component<ActivityScreenProps, State> {
    state: State = { activities: [], isLoading: true };
    private focusListener: any;

    componentDidMount() {
        this.focusListener = this.props.navigation.addListener('focus', this.loadActivities);
    }

    componentWillUnmount() {
        if (this.focusListener) this.props.navigation.removeListener('focus', this.loadActivities);
    }

    loadActivities = async () => {
        this.setState({ isLoading: true });
        const activities = await getActivities();
        this.setState({ activities, isLoading: false });
    };

    render() {
        if (this.state.isLoading) {
            return (
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.topBarContainer}>
                        <Text style={styles.topBarTitle}>{i18n.t('activity')}</Text>
                    </View>
                    <ActivityIndicator style={{ flex: 1 }} />
                </SafeAreaView>
            );
        }

        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.topBarContainer}>
                    <Text style={styles.topBarTitle}>{i18n.t('activity')}</Text>
                </View>

                <FlatList
                    data={this.state.activities}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <ActivityItem item={item} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>{i18n.t('noActivityYet')}</Text>}
                />
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff'
    },
    topBarContainer: {
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    topBarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000'
    },
    itemContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    thumbnail: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
    textContainer: { flex: 1 },
    activityText: { fontSize: 16, flexWrap: 'wrap' },
    timestamp: { fontSize: 12, color: 'gray', marginTop: 4 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
});