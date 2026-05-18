export type UserNotification = {
  notificationId: number;
  restaurantId: number;
  restaurantNameVN: string;
  restaurantNameJP: string;
  titleVn: string;
  titleJp: string;
  messageVn: string | null;
  messageJp: string | null;
  mediaUrl: string | null;
  startDate: string;
  endDate: string;
};

export type UserNotificationsResponse = {
  unreadCount: number;
  items: UserNotification[];
};
