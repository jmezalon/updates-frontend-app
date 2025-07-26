import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiService, Event } from '@/services/api';
import LikeButton from '@/components/LikeButton';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventDetails();
  }, [id]);

  const loadEventDetails = async () => {
    try {
      const eventData = await apiService.getEventById(parseInt(id as string));
      setEvent(eventData);
    } catch (error) {
      console.error('Error loading event details:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleWebsitePress = () => {
    if (event?.website) {
      Linking.openURL(event.website);
    }
  };

  const handlePhonePress = () => {
    if (event?.contact_phone) {
      Linking.openURL(`tel:${event.contact_phone}`);
    }
  };

  const handleEmailPress = () => {
    if (event?.contact_email) {
      Linking.openURL(`mailto:${event.contact_email}`);
    }
  };

  const handleShare = async () => {
    if (!event) return;
    
    try {
      // For development, use localhost. In production, replace with your actual domain
      const baseUrl = __DEV__ ? 'http://localhost:3000' : 'https://your-production-domain.com';
      const shareUrl = `${baseUrl}/events/${event.id}`;
      const shareMessage = `Check out this event: ${event.title}`;
      
      const result = await Share.share({
        message: `${shareMessage}\n\n${shareUrl}`,
        url: shareUrl, // iOS will use this for the URL
        title: event.title,
      });
      
      if (result.action === Share.sharedAction) {
        // Content was shared successfully
        console.log('Event shared successfully');
      }
    } catch (error) {
      console.error('Error sharing event:', error);
      Alert.alert('Error', 'Failed to share event');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Event</Text>
      </View>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Event Image */}
        {event.image_url && (
          <Image source={{ uri: event.image_url }} style={styles.eventImage} />
        )}

        {/* Event Title and Action Buttons */}
        <View style={styles.titleSection}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Text style={styles.shareButtonText}>↗ Share</Text>
            </TouchableOpacity>
            <LikeButton 
              eventId={parseInt(id as string)} 
              eventTitle={event.title}
              variant="icon"
              style={styles.likeButton}
            />
          </View>
        </View>

        {/* Church Information */}
        <View style={styles.churchSection}>
          <TouchableOpacity onPress={() => router.push(`/(tabs)/church/church_detail?id=${event.church_id}`)}>
            <Text style={[styles.churchName, styles.churchNameClickable]}>{event.church_name}</Text>
          </TouchableOpacity>
          {event.location && (
            <Text style={styles.location}>{event.location}</Text>
          )}
        </View>

        {/* Event Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>When?</Text>
          <Text style={styles.dateTime}>
            {formatDate(event.start_datetime)} <Text style={styles.startsText}>Starts:</Text> {formatTime(event.start_datetime)}
          </Text>
          {event.price !== undefined && (
            <>
              <Text style={styles.priceLabel}>Price:</Text>
              <Text style={styles.price}>
                {event.price === 0 ? 'Free' : `$${event.price}`}
              </Text>
            </>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact:</Text>
          {event.contact_phone && (
            <TouchableOpacity onPress={handlePhonePress}>
              <Text style={styles.contactLink}>{event.contact_phone}</Text>
            </TouchableOpacity>
          )}
          {event.contact_email && (
            <TouchableOpacity onPress={handleEmailPress}>
              <Text style={styles.contactLink}>{event.contact_email}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Website */}
        {event.website && (
          <View style={styles.websiteSection}>
            <Text style={styles.sectionTitle}>Website:</Text>
            <TouchableOpacity onPress={handleWebsitePress}>
              <Text style={styles.websiteLink}>{event.website}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Description */}
        {event.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FFB800',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e74c3c',
    flex: 1,
    marginRight: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#f1f3f4',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    height: 36,
  },
  shareButtonText: {
    fontSize: 14,
    color: '#030303',
    fontWeight: '500',
    letterSpacing: 0.25,
  },
  likeButton: {
    alignSelf: 'flex-start',
  },
  eventImage: {
    width: '100%',
    height: 350,
    resizeMode: 'cover',
    marginBottom: 0,
  },
  churchSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  churchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  churchNameClickable: {
    color: '#3498db',
    textDecorationLine: 'underline',
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  detailsSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  startsText: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  priceLabel: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  contactSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  contactLink: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 5,
    textDecorationLine: 'underline',
  },
  websiteSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  websiteLink: {
    fontSize: 16,
    color: '#3498db',
    textDecorationLine: 'underline',
  },
  descriptionSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});
