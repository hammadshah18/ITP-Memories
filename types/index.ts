export interface Memory {
  id: string
  title: string
  description: string
  date: string
  location: string
  imagePath: string
  uploadedBy: FriendName
  tags: string[]
  isPrivate: boolean
  createdAt: string
  series?: string
  taggedFriends?: string[]
  latitude?: number | null
  longitude?: number | null
  aspectRatio?: '1:1' | '3:4' | '16:9' | '9:16'
  displayType?: 'Portrait' | 'Landscape' | 'Story' | 'Square'
  createdByEmail?: string | null
}

export type FriendName = 'hammad Masood' | 'Raza Khan' | 'Hammad Shah' | 'Aitzaz Hasan'

export interface Friend {
  id: string
  name: FriendName
  nickname: string
  quote: string
  avatarColor: string
  initials: string
  memoriesCount: number
}

export interface TimelineEvent {
  id: string
  title: string
  date: string
  description: string
  memoryId?: string
  imagePath?: string
  type: 'milestone' | 'memory' | 'upcoming'
}

export interface UploadFormData {
  title: string
  description: string
  date: string
  location: string
  uploadedBy: FriendName
  tags: string
  isPrivate: boolean
  series?: string
  taggedFriends: string[]
  latitude: string
  longitude: string
  aspectRatio: '1:1' | '3:4' | '16:9' | '9:16'
  displayType: 'Portrait' | 'Landscape' | 'Story' | 'Square'
}
