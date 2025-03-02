# Bolt.new Prompt for Twisdom

## Project Vision

Build "Twisdom" - an AI-powered Twitter bookmark manager that helps users organize, search, and analyze their Twitter bookmarks. The application should provide an intuitive interface for importing, categorizing, and exploring bookmarked tweets with AI-enhanced features.

## Core Features

### MVP Features (Initial Release)

1. **Bookmark Import**
   - Allow users to upload Twitter data export files
   - Parse and extract bookmarked tweets
   - Store imported bookmarks for offline access

2. **AI-Powered Organization**
   - Generate concise summaries of bookmark content
   - Automatically suggest relevant tags based on content
   - Analyze sentiment (positive, negative, neutral)
   - Detect trends and patterns across bookmarks

3. **Search and Filtering**
   - Implement full-text search across all bookmarks
   - Filter by tags, date, and sentiment
   - Sort by different criteria (date, alphabetical)

4. **User Interface**
   - Provide multiple views (list, card, timeline)
   - Support dark/light mode themes
   - Create a responsive design that works on various screen sizes
   - Include smooth animations for a polished experience

### High Priority Features (Next Phase)

1. **Reading Queue**
   - Allow marking items as "to read"
   - Track read/unread status
   - Provide a dedicated view for the reading queue

2. **Favorites and Collections**
   - Let users star important bookmarks
   - Create custom collections to group related bookmarks

3. **Insights Dashboard**
   - Visualize topic trends and tag frequency
   - Show sentiment distribution
   - Display bookmark activity over time

## User Flows

### First-time Setup
1. User exports Twitter data from Twitter settings
2. User uploads the bookmarks file to Twisdom
3. System processes the file and extracts bookmarks
4. AI automatically generates summaries and suggests tags
5. User is presented with their organized bookmarks

### Daily Usage
1. User browses bookmarks in preferred view
2. User searches for specific content
3. User filters bookmarks by tags or other criteria
4. User reviews reading queue items
5. User checks insights dashboard for patterns

### Bookmark Organization
1. User adds custom tags to bookmarks
2. User stars important bookmarks
3. User creates collections for specific topics
4. User marks items as read when processed

## Data Structure Concepts

The application should store:
- Bookmark information (tweet text, author, timestamp, URL)
- AI-generated metadata (summary, sentiment, suggested tags)
- User-created organization (custom tags, read status, favorites, collections)

## Visual Design Direction

- Clean, minimal interface with focus on content
- Smooth transitions between views
- Consistent visual hierarchy
- Accessible color scheme with dark/light options
- Card-based design for bookmarks

## Privacy Considerations

- Store data locally on the user's device
- Only send tweet text to AI service for processing (no personal data)
- Allow users to disable AI features if desired
- Provide data export functionality

## Target Users

The application is designed for:
- Information collectors who save lots of valuable Twitter content
- Researchers who use Twitter for professional work
- Content creators looking for inspiration
- Avid readers who bookmark articles to read later
- Knowledge workers who curate Twitter content by topic

## Success Metrics

- Percentage of imported bookmarks that users access via search
- Frequency of AI-generated summary usage
- User satisfaction with organization system
- Time saved in finding specific bookmarked content