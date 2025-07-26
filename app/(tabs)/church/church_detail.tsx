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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiService, Church, Event, Announcement, Donation } from '@/services/api';
import FollowButton from '@/components/FollowButton';

// Helper function to get payment method branding
const getPaymentMethodBranding = (method: string) => {
  const methodLower = method.toLowerCase();
  
  if (methodLower.includes('zelle')) {
    return {
      icon: 'card' as const,
      color: '#6B46C1', // Purple
      backgroundColor: '#F3F4F6'
    };
  } else if (methodLower.includes('cash app') || methodLower.includes('cashapp')) {
    return {
      icon: 'logo-usd' as const,
      color: '#00D632', // Green
      backgroundColor: '#F0FDF4'
    };
  } else if (methodLower.includes('paypal')) {
    return {
      icon: 'card' as const,
      color: '#0070BA', // Blue
      backgroundColor: '#EFF6FF'
    };
  } else if (methodLower.includes('venmo')) {
    return {
      icon: 'card' as const,
      color: '#3D95CE', // Light Blue
      backgroundColor: '#F0F9FF'
    };
  } else if (methodLower.includes('apple pay')) {
    return {
      icon: 'phone-portrait' as const,
      color: '#000000', // Black
      backgroundColor: '#F9FAFB'
    };
  } else if (methodLower.includes('google pay')) {
    return {
      icon: 'phone-portrait' as const,
      color: '#4285F4', // Google Blue
      backgroundColor: '#F0F9FF'
    };
  } else {
    return {
      icon: 'card' as const,
      color: '#6B7280', // Gray
      backgroundColor: '#F9FAFB'
    };
  }
};

export default function ChurchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const [church, setChurch] = useState<Church | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<Announcement[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadChurchData();
  }, [id]);

  const loadChurchData = async () => {
    try {
      const churchId = parseInt(id as string);
      
      // Load church details, events, announcements, weekly schedule, and donations in parallel
      const [churchData, eventsData, announcementsData, weeklyData, donationsData] = await Promise.all([
        apiService.getChurch(churchId),
        apiService.getEventsByChurch(churchId),
        apiService.getAnnouncementsByChurch(churchId),
        apiService.getWeeklyAnnouncementsByChurch(churchId),
        apiService.getDonationsByChurch(churchId)
      ]);

      setChurch(churchData);
      setEvents(eventsData);
      setAnnouncements(announcementsData);
      setWeeklySchedule(weeklyData);
      setDonations(donationsData);
    } catch (error) {
      console.error('Error loading church data:', error);
      Alert.alert('Error', 'Failed to load church information');
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (eventId: number) => {
    router.push(`/(tabs)/event_details?id=${eventId}`);
  };

  const handleWebsitePress = () => {
    if (church?.website) {
      Linking.openURL(church.website);
    }
  };

  const handlePhonePress = () => {
    if (church?.contact_phone) {
      Linking.openURL(`tel:${church.contact_phone}`);
    }
  };

  const handleEmailPress = () => {
    if (church?.contact_email) {
      Linking.openURL(`mailto:${church.contact_email}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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

  const formatScheduleTime = (timeString: string) => {
    // Handle time strings like "09:00" or "2:00 PM"
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const minute = minutes.replace(/[^0-9]/g, ''); // Remove non-numeric characters
      const isPM = timeString.toLowerCase().includes('pm') || hour >= 12;
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      return `${displayHour}:${minute.padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
    }
    return timeString; // Return as-is if not in expected format
  };

  const getDayName = (day?: number) => {
    if (day === undefined || day === null) return null;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || null;
  };

  const toggleAnnouncementExpansion = (announcementId: number) => {
    setExpandedAnnouncements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading church information...</Text>
      </View>
    );
  }

  if (!church) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Church not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Church</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Church Banner */}
        {church.banner_url && (
          <Image source={{ uri: church.banner_url }} style={styles.bannerImage} />
        )}

        {/* Church Header */}
        <View style={styles.churchHeader}>
          {church.logo_url && (
            <Image source={{ uri: church.logo_url }} style={styles.churchAvatar} />
          )}
          <View style={styles.churchInfo}>
            <Text style={styles.churchName}>{church.name}</Text>
            <Text style={styles.location}>
              {[church.address, church.city, church.state].filter(Boolean).join(', ')}
            </Text>
            <View style={styles.followerContainer}>
              <Text style={styles.followerCount}>{(church.follower_count || 0)} followers</Text>
            </View>
          </View>
          <FollowButton 
            churchId={parseInt(id)} 
            churchName={church.name}
            style={styles.followButton}
            onFollowChange={() => loadChurchData()}
          />
        </View>

        {/* Leadership Section */}
        {(church.senior_pastor || church.pastor || church.assistant_pastor) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leadership</Text>
            
            {church.senior_pastor && (
              <View style={styles.leadershipItem}>
                {church.senior_pastor_avatar ? (
                  <Image 
                    source={{ uri: church.senior_pastor_avatar }} 
                    style={styles.pastorAvatar}
                  />
                ) : (
                  <View style={[styles.pastorAvatar, styles.defaultAvatar]}>
                    <Text style={styles.avatarInitials}>
                      {church.senior_pastor.split(' ').map(name => name[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.leadershipInfo}>
                  <Text style={styles.leadershipRole}>Senior Pastor</Text>
                  <Text style={styles.leadershipName}>{church.senior_pastor}</Text>
                </View>
              </View>
            )}
            
            {church.pastor && (
              <View style={styles.leadershipItem}>
                {church.pastor_avatar ? (
                  <Image 
                    source={{ uri: church.pastor_avatar }} 
                    style={styles.pastorAvatar}
                  />
                ) : (
                  <View style={[styles.pastorAvatar, styles.defaultAvatar]}>
                    <Text style={styles.avatarInitials}>
                      {church.pastor.split(' ').map(name => name[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.leadershipInfo}>
                  <Text style={styles.leadershipRole}>Pastor</Text>
                  <Text style={styles.leadershipName}>{church.pastor}</Text>
                </View>
              </View>
            )}
            
            {church.assistant_pastor && (
              <View style={styles.leadershipItem}>
                {church.assistant_pastor_avatar ? (
                  <Image 
                    source={{ uri: church.assistant_pastor_avatar }} 
                    style={styles.pastorAvatar}
                  />
                ) : (
                  <View style={[styles.pastorAvatar, styles.defaultAvatar]}>
                    <Text style={styles.avatarInitials}>
                      {church.assistant_pastor.split(' ').map(name => name[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.leadershipInfo}>
                  <Text style={styles.leadershipRole}>Assistant Pastor</Text>
                  <Text style={styles.leadershipName}>{church.assistant_pastor}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          {church.contact_phone && (
            <TouchableOpacity onPress={handlePhonePress}>
              <Text style={styles.contactLink}>{church.contact_phone}</Text>
            </TouchableOpacity>
          )}
          {church.contact_email && (
            <TouchableOpacity onPress={handleEmailPress}>
              <Text style={styles.contactLink}>{church.contact_email}</Text>
            </TouchableOpacity>
          )}
          {church.website && (
            <TouchableOpacity onPress={handleWebsitePress}>
              <Text style={styles.contactLink}>{church.website}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Upcoming Events */}
        {events.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {events.slice(0, 3).map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event.id)}
              >
                <View style={styles.eventDate}>
                  <Text style={styles.eventDateText}>{formatDate(event.start_datetime)}</Text>
                  <Text style={styles.eventTimeText}>{formatTime(event.start_datetime)}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.location && (
                    <Text style={styles.eventLocation}>{event.location}</Text>
                  )}
                  {event.price !== undefined && (
                    <Text style={styles.eventPrice}>
                      {event.price === 0 ? 'Free' : `$${event.price}`}
                    </Text>
                  )}
                </View>
                <View style={styles.reminderContentContainer}>
                    {event.image_url && (
                      <View style={styles.reminderImageContainer}>
                        <Image 
                          source={{ uri: event.image_url }} 
                          style={styles.reminderImageSmall}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                  </View>
              </TouchableOpacity>
            ))}
            {events.length > 3 && (
              <Text style={styles.moreEventsText}>+ {events.length - 3} more events</Text>
            )}
          </View>
        )}

        {/* Reminders */}
        {announcements.filter(a => a.is_special).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminders</Text>
            {announcements
              .filter(a => a.is_special)
              .slice(0, 3)
              .map((reminder) => {
                const isExpanded = expandedAnnouncements.has(reminder.id);
                return (
                  <TouchableOpacity 
                    key={reminder.id} 
                    style={styles.reminderCard}
                    onPress={() => reminder.image_url ? toggleAnnouncementExpansion(reminder.id) : null}
                    activeOpacity={reminder.image_url ? 0.7 : 1}
                  >
                    {isExpanded && reminder.image_url ? (
                      // Expanded state: show only image
                      <View style={styles.reminderImageOnlyContainer}>
                        <Image 
                          source={{ uri: reminder.image_url }} 
                          style={styles.reminderImageFullView}
                          resizeMode="contain"
                        />
                      </View>
                    ) : (
                      // Normal state: show content with optional small image
                      <View style={styles.reminderContentContainer}>
                        <View style={styles.reminderMainContent}>
                          <View style={styles.reminderHeader}>
                            <Text style={styles.reminderTitle}>{reminder.title}</Text>
                            <View style={styles.reminderBadge}>
                              <Text style={styles.reminderBadgeText}>Special</Text>
                            </View>
                          </View>
                          <Text style={styles.reminderDescription}>{reminder.description || ''}</Text>
                        </View>
                        {reminder.image_url && (
                          <View style={styles.reminderImageContainer}>
                            <Image 
                              source={{ uri: reminder.image_url }} 
                              style={styles.reminderImageSmall}
                              resizeMode="cover"
                            />
                          </View>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            }
            {announcements.filter(a => a.is_special).length > 3 && (
              <Text style={styles.moreRemindersText}>
                + {announcements.filter(a => a.is_special).length - 3} more reminders
              </Text>
            )}
          </View>
        )}

        {/* Weekly Schedule */}
        {weeklySchedule.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            {(() => {
              // Group activities by day
              const groupedByDay = weeklySchedule.reduce((acc, schedule) => {
                const day = schedule.day ?? 0; // Default to Sunday if no day specified
                if (!acc[day]) {
                  acc[day] = [];
                }
                acc[day].push(schedule);
                return acc;
              }, {} as Record<number, typeof weeklySchedule>);

              // Sort days (Sunday=0 to Saturday=6)
              const sortedDays = Object.keys(groupedByDay)
                .map(Number)
                .sort((a, b) => a - b);

              return sortedDays.map(dayNumber => {
                const dayActivities = groupedByDay[dayNumber];
                const dayName = getDayName(dayNumber);
                
                return (
                  <View key={dayNumber} style={styles.dayGroup}>
                    <Text style={styles.dayHeader}>{dayName}</Text>
                    {dayActivities.map((schedule) => {
                      const isExpanded = expandedAnnouncements.has(schedule.id);
                      return (
                        <TouchableOpacity 
                          key={schedule.id} 
                          style={styles.scheduleCard}
                          onPress={() => schedule.image_url ? toggleAnnouncementExpansion(schedule.id) : null}
                          activeOpacity={schedule.image_url ? 0.7 : 1}
                        >
                          {isExpanded && schedule.image_url ? (
                            // Expanded state: show only image
                            <View style={styles.scheduleImageOnlyContainer}>
                              <Image 
                                source={{ uri: schedule.image_url }} 
                                style={styles.scheduleImageFullView}
                                resizeMode="contain"
                              />
                            </View>
                          ) : (
                            // Normal state: show content with optional small image (no day badge)
                            <View style={styles.scheduleContent}>
                              <View style={styles.scheduleMainContent}>
                                <View style={styles.scheduleHeader}>
                                  <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                                  {schedule.start_time && (
                                    <Text style={styles.scheduleTime}>
                                      {formatScheduleTime(schedule.start_time)}
                                      {schedule.end_time && ` - ${formatScheduleTime(schedule.end_time)}`}
                                    </Text>
                                  )}
                                </View>
                                {schedule.description && (
                                  <Text style={styles.scheduleDescription}>{schedule.description}</Text>
                                )}
                              </View>
                              {schedule.image_url && (
                                <View style={styles.scheduleImageContainer}>
                                  <Image 
                                    source={{ uri: schedule.image_url }} 
                                    style={styles.scheduleImageSmall}
                                    resizeMode="cover"
                                  />
                                </View>
                              )}
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              });
            })()}
          </View>
        )}

        {/* Donations */}
        {donations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Donations</Text>
            <Text style={styles.donationDescription}>
              Support {church.name} through the following payment methods:
            </Text>
            {donations.map((donation) => {
              const branding = getPaymentMethodBranding(donation.method);
              return (
                <View 
                  key={donation.id} 
                  style={[
                    styles.donationCard, 
                    { 
                      borderLeftColor: branding.color,
                      backgroundColor: branding.backgroundColor
                    }
                  ]}
                >
                  <View style={styles.donationHeader}>
                    <View style={styles.donationMethodContainer}>
                      <View style={[styles.donationIconContainer, { backgroundColor: branding.color }]}>
                        <Ionicons 
                          name={branding.icon} 
                          size={20} 
                          color="white" 
                        />
                      </View>
                      <Text style={[styles.donationMethod, { color: branding.color }]}>
                        {donation.method}
                      </Text>
                    </View>
                    {donation.contact_name && (
                      <Text style={styles.donationTitle}>{donation.contact_name}</Text>
                    )}
                  </View>
                <TouchableOpacity 
                  style={styles.donationInfo}
                  onPress={() => {
                    if (donation.method.toLowerCase() === 'zelle' || donation.method.toLowerCase() === 'paypal') {
                      // For Zelle/PayPal, copy email/phone to clipboard
                      // You could implement clipboard functionality here
                      Alert.alert('Payment Info', `${donation.method}: ${donation.contact_info}`);
                    } else if (donation.method.toLowerCase().includes('cash app')) {
                      // For Cash App, try to open the app
                      const cashAppUrl = `https://cash.app/${donation.contact_info.replace('$', '')}`;
                      Linking.openURL(cashAppUrl).catch(() => {
                        Alert.alert('Payment Info', `Cash App: ${donation.contact_info}`);
                      });
                    } else {
                      Alert.alert('Payment Info', `${donation.method}: ${donation.contact_info}`);
                    }
                  }}
                >
                  <Text style={styles.donationAccount}>{donation.contact_info}</Text>
                  <Text style={styles.donationTapHint}>Tap to copy or open</Text>
                </TouchableOpacity>
                {donation.note && (
                  <Text style={styles.donationNote}>{donation.note}</Text>
                )}
              </View>
              );
            })}
          </View>
        )}

        {/* Description */}
        {church.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{church.description}</Text>
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
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
  bannerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  churchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  churchAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  churchInfo: {
    flex: 1,
  },
  churchName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  followButton: {
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 12,
  },
  leadershipText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  leadershipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pastorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  leadershipInfo: {
    flex: 1,
  },
  leadershipRole: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
    marginBottom: 2,
  },
  leadershipName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  defaultAvatar: {
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Weekly Schedule Styles
  scheduleCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  scheduleDayBadge: {
    backgroundColor: '#3498db',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
    minWidth: 60,
  },
  dayGroup: {
    marginBottom: 16,
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  scheduleContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scheduleMainContent: {
    flex: 1,
    marginRight: 12,
  },
  scheduleImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleImageSmall: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  scheduleImageExpanded: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  scheduleImageOnlyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  scheduleImageFullView: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  // Reminders Styles
  reminderCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  reminderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ffc107',
  },
  reminderBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  reminderContentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reminderMainContent: {
    flex: 1,
    marginRight: 12,
  },
  reminderDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reminderImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderImageSmall: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  reminderImageExpanded: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  reminderImageOnlyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  reminderImageFullView: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  moreRemindersText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  contactLink: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  eventDate: {
    width: 60,
    alignItems: 'center',
    marginRight: 12,
  },
  eventDateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  eventTimeText: {
    fontSize: 12,
    color: '#666',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eventPrice: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  moreEventsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  announcementCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  announcementType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
  },
  specialType: {
    backgroundColor: '#fff3cd',
  },
  weeklyType: {
    backgroundColor: '#d1ecf1',
  },
  yearlyType: {
    backgroundColor: '#f8d7da',
  },
  announcementTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
  },
  announcementContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  moreAnnouncementsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  followerContainer: {
    marginTop: 4,
  },
  followerCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  // Donation styles
  donationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  donationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  donationMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  donationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  donationMethod: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  donationTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  donationInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  donationAccount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  donationTapHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  donationNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    lineHeight: 16,
  },
});
