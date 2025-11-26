import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, X } from 'lucide-react'; 

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string; // Stored as "HH:MM" (24-hour format) for easier comparison
  location?: string;
  attendees?: string[];
  color: string;
}

// Helper function to convert 24-hour time "HH:MM" to "h:mm AM/PM" for display
const formatTime = (time24: string): string => {
  if (!time24) return '';
  const [hourStr, minuteStr] = time24.split(':');
  const hours = parseInt(hourStr, 10);
  const minutes = minuteStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Converts 0 to 12
  return `${displayHours}:${minutes} ${ampm}`;
};

export default function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Team Meeting',
      date: new Date(), // Today
      time: '10:00', // 10:00 AM
      location: 'Conference Room A',
      attendees: ['John', 'Sarah'],
      color: 'bg-blue-600',
    },
    {
      id: '2',
      title: 'Project Deadline',
      date: new Date(new Date().setDate(new Date().getDate() + 3)),
      time: '17:00', // 5:00 PM
      color: 'bg-red-600',
    },
    {
      id: '3',
      title: 'Client Lunch',
      date: new Date(new Date().setDate(new Date().getDate() + 8)),
      time: '12:30', // 12:30 PM
      location: 'The Bistro',
      color: 'bg-green-600',
    },
    {
      id: '4',
      title: 'Monthly Review',
      date: new Date(new Date().setDate(new Date().getDate() + 15)),
      time: '14:00', // 2:00 PM
      color: 'bg-purple-600',
    },
    {
      id: '5',
      title: 'Training Session',
      date: new Date(new Date().setDate(new Date().getDate() + 20)),
      time: '09:00', // 9:00 AM
      color: 'bg-yellow-600',
    },
    {
      id: '6',
      title: 'Follow-up Call',
      date: new Date(new Date().setDate(new Date().getDate() + 25)),
      time: '11:00', // 11:00 AM
      color: 'bg-indigo-600',
    },
    {
        id: '7',
        title: 'Q4 Planning',
        date: new Date(new Date().setDate(new Date().getDate() + 30)),
        time: '15:00', // 3:00 PM
        color: 'bg-blue-600',
    },
    {
        id: '8',
        title: 'Holiday Party Prep',
        date: new Date(new Date().setDate(new Date().getDate() + 45)),
        time: '18:00', // 6:00 PM
        color: 'bg-red-600',
    },
  ]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    time: '10:00', // Default time in 24-hour format
    location: '', 
    color: 'bg-blue-600' 
  });

  // Helper function to create a complete Date object from event.date and event.time
  const getEventStartDateTime = (event: Event): Date => {
    // If no time is set (e.g., if we were to support all-day), default to midnight of the next day
    if (!event.time) {
      const midnight = new Date(event.date);
      midnight.setHours(23, 59, 59, 999);
      return midnight;
    }
    
    const [hoursStr, minutesStr] = event.time.split(':');
    const eventStart = new Date(event.date);
    
    // Create a new Date object using the year, month, and day from the event date,
    // and the hours/minutes from the time string.
    const eventDateTime = new Date(
      eventStart.getFullYear(), 
      eventStart.getMonth(), 
      eventStart.getDate(), 
      parseInt(hoursStr, 10), 
      parseInt(minutesStr, 10)
    );
    return eventDateTime;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); 

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDate = (day: number) => {
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === day &&
          eventDate.getMonth() === currentDate.getMonth() &&
          eventDate.getFullYear() === currentDate.getFullYear();
      })
      .sort((a, b) => (a.time > b.time ? 1 : -1));
  };

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title) return;

    setEvents([...events, {
      id: Date.now().toString(),
      title: newEvent.title,
      date: new Date(selectedDate.getTime()), 
      time: newEvent.time, // already in HH:MM format from input field
      location: newEvent.location,
      color: newEvent.color,
    }]);

    setShowEventModal(false);
    setSelectedDate(null);
    setNewEvent({ title: '', time: '10:00', location: '', color: 'bg-blue-600' });
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(selected);
    setShowEventModal(true);
  };
  
  const handleNewEventClick = () => {
    setSelectedDate(new Date()); 
    setShowEventModal(true);
  };


  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };
  
  // FIX: Filter based on the complete event date and time
  const upcomingEvents = events
    .filter(event => getEventStartDateTime(event).getTime() > new Date().getTime())
    .sort((a, b) => getEventStartDateTime(a).getTime() - getEventStartDateTime(b).getTime());


  return (
    <div className="flex flex-col h-screen bg-gray-50"> 
      
      {/* Header/Navigation Area (Fixed height) */}
      <div className="flex-shrink-0 border-b p-4 bg-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900">🗓️ Calendar</h1>
          <button
            onClick={handleNewEventClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition duration-150 shadow-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            New Event
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Previous month">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Next month">
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Main Calendar Content - Scrollable area */}
      <div className="flex-1 p-4 overflow-y-auto pb-32"> 
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-bold text-gray-700 py-2 border-b-2 border-gray-200">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {/* Empty placeholders for days before the 1st */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square bg-gray-100 rounded-lg" />
          ))}

          {/* Actual days in the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDate(day);

            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={`aspect-square border rounded-lg p-1 md:p-2 cursor-pointer transition duration-150 ease-in-out shadow-sm
                  ${isToday(day) ? 'border-blue-600 bg-blue-100/70 ring-2 ring-blue-500' : 'border-gray-200 bg-white hover:bg-gray-50'}
                `}
              >
                <div className={`text-sm font-bold ${isToday(day) ? 'text-blue-700' : 'text-gray-800'}`}>
                  {day}
                </div>
                
                <div className="space-y-0.5 mt-0.5 overflow-hidden h-7 md:h-10">
                  {dayEvents.slice(0, 2).map(event => (
                    <div 
                      key={event.id} 
                      className={`text-xs ${event.color} text-white px-1 py-0.5 rounded-md truncate font-medium block`}
                      title={`${formatTime(event.time)} ${event.title}`} // Tooltip for full event info
                    >
                      {/* Display time in 12-hour format */}
                      {formatTime(event.time)}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 mt-0.5 font-semibold">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Events List */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div key={event.id} className="flex items-start gap-4 p-4 border rounded-xl bg-white hover:shadow-lg transition duration-200">
                  <div className={`w-1.5 h-auto min-h-full ${event.color} rounded-full flex-shrink-0`} />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{event.title}</h4>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        {event.date.toLocaleDateString()} at {formatTime(event.time)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-green-500" />
                          {event.location}
                        </div>
                      )}
                      {event.attendees && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-purple-500" />
                          {event.attendees.length} Attendees
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic p-4 text-center">No upcoming events scheduled.</p>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-2xl font-bold text-gray-800">Add Event on {selectedDate?.toLocaleDateString()}</h3>
                <button 
                    onClick={() => {
                        setShowEventModal(false); 
                        setNewEvent({ title: '', time: '10:00', location: '', color: 'bg-blue-600' });
                    }}
                    className="p-1 rounded-full hover:bg-gray-100"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Event title (required)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location (Optional)</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="e.g., Zoom call, Office"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Color Tag</label>
                <div className="flex gap-3">
                  {['bg-blue-600', 'bg-red-600', 'bg-green-600', 'bg-yellow-600', 'bg-purple-600', 'bg-indigo-600'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewEvent({ ...newEvent, color })}
                      className={`w-8 h-8 rounded-full ${color} transition duration-150 ${newEvent.color === color ? 'ring-4 ring-offset-2 ring-blue-500 shadow-md' : 'hover:scale-110'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddEvent}
                className={`flex-1 text-white py-3 rounded-xl font-bold transition duration-150 shadow-lg ${
                    newEvent.title 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={!newEvent.title}
              >
                Add Event
              </button>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedDate(null);
                  setNewEvent({ title: '', time: '10:00', location: '', color: 'bg-blue-600' });
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}