export interface FriendBirthday {
  name: string
  day: number
  month: number
  year: number
}

export const FRIENDS_BIRTHDAYS: FriendBirthday[] = [
  { name: 'Hammad Shah', day: 7, month: 11, year: 2005 },
  { name: 'Aitzaz Hassan', day: 11, month: 5, year: 2005 },
  { name: 'Hammad Masood', day: 26, month: 9, year: 2005 },
  { name: 'Raza Khan', day: 14, month: 3, year: 2005 },
]

export function getNextBirthdayDate(friend: FriendBirthday, fromDate = new Date()) {
  const year = fromDate.getFullYear()
  const candidate = new Date(year, friend.month - 1, friend.day)

  if (candidate < new Date(year, fromDate.getMonth(), fromDate.getDate())) {
    return new Date(year + 1, friend.month - 1, friend.day)
  }

  return candidate
}

export function getDaysUntilBirthday(friend: FriendBirthday, fromDate = new Date()) {
  const nextBirthday = getNextBirthdayDate(friend, fromDate)
  const startOfToday = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
  const diffMs = nextBirthday.getTime() - startOfToday.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export function getAgeOnBirthday(friend: FriendBirthday, year = new Date().getFullYear()) {
  return year - friend.year
}
