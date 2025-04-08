# Product Requirements Document: LifeLine App
## 1. Introduction

LifeLine is a simple and user-friendly mobile application designed to help users track and reflect on their personal lives through an intuitive, swipeable timeline. The app allows users to record events, memories, and milestones, providing a visual representation of their past, present, and future.

## 2. Goals

The primary goals of the LifeLine app are to:

* Provide users with a clear and engaging visual representation of their life timeline.
* Enable users to easily record and access important events and memories.
* Offer a simple and intuitive user interface for seamless navigation and interaction.
* Allow users to reflect on their past and plan for the future.
* Offer personalization through dark and light mode options.
* Eventually provide a mechanism for users to securely store and access their timeline across devices.

## 3. Target Audience

The target audience for the LifeLine app includes individuals of all ages who are interested in:

* Tracking their personal history and significant life events.
* Reflecting on past experiences and memories.
* Having a visual overview of their life journey.
* Using a simple and user-friendly mobile application for personal organization.

## 4. App Overview

LifeLine centers around a horizontal, swipeable timeline that visually represents the user's life from their birthdate to a projected age of 100. Users can navigate this timeline by swiping left to explore the past and right to look into the future. The timeline dynamically adjusts its granularity based on the zoom level, displaying dates in hours, days, weeks, months, or years. Users can interact with the timeline by clicking on date markers to add events or by using a dedicated "Add Event" button. Events are displayed as speech bubbles associated with their corresponding date markers on the timeline. The app will initially store data locally, with a future option for users to create accounts and save their timelines in the cloud.

## 5. Key Features

### 5.1. Timeline Display and Navigation

* **Horizontal Timeline:** A central horizontal line with ruler-like markings and small vertical lines indicating dates.
* **Initial Timeline Range:** Upon first launch, after the user provides their birthdate, the timeline will span from their birthdate to 100 years in the future.
* **Current Date Focus:** Each time the app is opened, the timeline will initially display the current date.
* **Swipeable Navigation:** Users can swipe left to navigate to past dates and right to navigate to future dates.
* **"Go to Current Date" Button:** A dedicated button that, when pressed, will smoothly scroll the timeline to the current date, regardless of the user's current position on the timeline.

### 5.2. Initial Setup (Birthday Input)

* **First-Time Launch Popup:** When the app is opened for the first time, a modal or popup will appear prompting the user to enter their birthdate (day, month, year).
* **Date Picker:** A user-friendly date picker component should be used for birthday selection.
* **Timeline Generation:** Once the birthdate is submitted, the app will generate the initial timeline.
* **No Repeated Prompt:** This birthday input prompt should only appear on the first app launch.

### 5.3. Zooming and Date Granularity

* **Zoom Functionality:** Users should be able to zoom in and out on the timeline using pinch-to-zoom gestures.
* **Dynamic Date Granularity:** The timeline should dynamically adjust the displayed date granularity based on the zoom level:
    * **Maximum Zoom In:** Displays dates in hours.
    * **Zoom Out (Level 1):** Displays dates in days.
    * **Zoom Out (Level 2):** Displays dates in weeks.
    * **Zoom Out (Level 3):** Displays dates in months.
    * **Maximum Zoom Out:** Displays dates in years.
* **Smooth Transition:** The transition between different date granularities should be smooth and visually appealing.

### 5.4. Event Management

#### 5.4.1. Adding Events via Timeline Click

* **Clickable Date Markers:** The small vertical lines representing dates on the timeline should be clickable.
* **Task Input Popup:** When a date marker is clicked, a popup or modal will appear with a text input field for the user to enter a task or event description.
* **Save Button:** The popup should have a "Save" button to store the entered event associated with the selected date.
* **Cancel Button:** A "Cancel" button should also be present to close the popup without saving.

#### 5.4.2. Adding Events via "Add Event" Button

* **Dedicated Button:** A clearly visible "Add Event" button should be present on the screen (e.g., in the header or footer).
* **Event Creation Popup:** Clicking this button will open a popup or modal with the following fields:
    * **Date Selection:** A date picker component allowing the user to choose the date for the event.
    * **Event Description:** A text input field for the user to enter the event details.
* **Save Button:** A "Save" button to store the event with the selected date and description.
* **Cancel Button:** A "Cancel" button to close the popup without saving.

### 5.5. Event Display

* **Speech Bubble Visualization:** Events should be displayed as speech bubbles or similar visual indicators connected to the small vertical line (date marker) they are associated with.
* **Placement:** The speech bubbles should be positioned in a way that they are easily readable and do not overlap excessively. Consider displaying them above or below the timeline line, potentially alternating sides to avoid clutter.
* **Text Display:** The text entered by the user for the event should be clearly visible within the speech bubble.
* **Event Persistence:** Once an event is saved, it should be persistently displayed on the timeline whenever the user navigates to the corresponding date and zoom level.

### 5.6. Dark and Light Mode

* **Toggle Switch/Button:** The app should include a toggle switch or button in the settings or a readily accessible location to allow users to switch between dark and light mode.
* **Theme Application:** The app's UI elements (backgrounds, text colors, timeline colors, etc.) should dynamically change based on the selected mode to ensure optimal readability and user experience in both light and dark environments.

### 5.7. Account Creation and Data Storage (Future Enhancement)

* **Local Storage (Initial):** Initially, all event data and user preferences (like dark/light mode) will be stored locally on the user's device.
* **Future Account Creation:** In a future version, the app should allow users to create an account (e.g., using email and password or social login).
* **Cloud Data Sync:** Once an account is created and the user is logged in, their timeline data should be securely stored in the Supabase backend and synchronized across their devices.

## 6. User Stories

* As a new user, I want to easily input my birthdate so that the app can generate my life timeline.
* As a user, I want the app to automatically show me the current date when I open it so I can see where I am on my timeline.
* As a user, I want to swipe left and right on the timeline to explore my past and future.
* As a user, I want to zoom in and out on the timeline to see dates in different granularities (hours, days, weeks, months, years).
* As a user, I want to click on a specific date on the timeline and easily add an event or memory associated with that date.
* As a user, I want to be able to add an event for a specific date in the past or future without having to swipe to that date.
* As a user, I want to see my recorded events clearly displayed on the timeline.
* As a user, I want to be able to switch between a light and dark mode for better viewing in different lighting conditions.
* As a user, I want a button that quickly brings me back to the current date on the timeline.
* (Future) As a user, I want to create an account so that my timeline data is backed up and accessible on multiple devices.

## 7. Technical Requirements

* **Frontend:** React Native with TypeScript, Expo, and Expo Router
* **Backend/Database:** Supabase
* **UI Framework:** React Native Paper

## 8. Success Metrics

The success of the LifeLine app will be measured by:

* **Number of Downloads and Active Users:** Tracking the growth of the user base.
* **User Engagement:** Monitoring the frequency of app usage and the average time spent in the app.
* **Event Creation Rate:** Measuring how often users are adding events to their timeline.
* **User Retention:** Tracking the percentage of users who continue to use the app over time.
* **App Store Ratings and Reviews:** Monitoring user feedback and satisfaction.
* **Dark/Light Mode Usage:** Assessing the adoption of the personalization options.

## 9. Future Considerations

* **Reminders and Notifications:** Allow users to set reminders for future events.
* **Event Categorization/Tagging:** Enable users to categorize or tag events for better organization and filtering.
* **Search Functionality:** Implement a search feature to quickly find specific events on the timeline.
* **Visualizations and Statistics:** Provide insights and visualizations based on the user's recorded events (e.g., number of events per year).
* **Sharing Options (with privacy controls):** Allow users to optionally share parts of their timeline with trusted individuals.
* **Integration with Calendar Apps:** Option to sync events with the user's device calendar.
* **Advanced Zoom Levels:** Potentially add more granular zoom levels (e.g., minutes).
* **Customizable Timeline Appearance:** Allow users to customize the colors and styles of the timeline and events.

## 10. Project Folder Structure

The following is an optimal, scalable folder structure for the LifeLine React Native app:

```
/app
  /assets               # Images, fonts, icons, videos
  /components           # Reusable UI components (buttons, inputs, timeline elements)
  /constants            # App-wide constants (colors, strings, config)
  /contexts             # React Context providers (theme, auth, user data)
  /hooks                # Custom React hooks
  /navigation           # Navigation stacks, tabs, and routing config
  /screens              # App screens/views (Home, Timeline, EventDetails, Settings)
  /services
    /api                # API calls, Supabase client setup
    /storage            # Local storage helpers (AsyncStorage)
  /theme                # Light/dark theme definitions, styles
  /types                # TypeScript type definitions and interfaces
  /utils                # Utility functions/helpers
  /localization         # (Optional) Localization files for multi-language support
  /tests                # Unit and integration tests
app.json                # Expo configuration
package.json            # Project metadata and dependencies
README.md               # Project overview
docs/                   # Documentation, PRD, architecture, etc.
```

**Notes:**
- Keep components small and reusable.
- Group screens by feature if app grows.
- Separate API logic from UI.
- Use contexts for global state (auth, theme).
- Organize tests mirroring the source structure.
- Store secrets and environment variables securely (never hardcoded).