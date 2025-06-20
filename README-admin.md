# Admin Panel

## Overview
The admin panel allows you to add new games to the Supabase database through a user-friendly web interface.

## Access
- **URL**: `/admin`
- **Navigation**: Click the "Admin" link in the header navigation

## Features

### Add New Game
The admin panel provides a comprehensive form to add new games with the following fields:

#### Required Fields
- **Game Title**: The name of the game (automatically generates slug)
- **Description**: Detailed description of the game
- **Category**: Select from predefined categories (Action, Adventure, RPG, etc.)

#### Optional Fields
- **Slug**: Auto-generated from title, but can be manually edited
- **Source**: Game developer/publisher
- **Contract Address**: Blockchain contract address (for NFT games)
- **OpenSea URL**: Link to OpenSea collection
- **Storage Path**: Path for game files storage
- **Release Date**: Game release date
- **Images**: Multiple image URLs (can add/remove as needed)

### Form Features
- **Auto-slug generation**: Slug is automatically created from the title
- **Dynamic image fields**: Add or remove image URL fields as needed
- **Form validation**: Required fields are validated before submission
- **Success/Error feedback**: Clear messages after form submission
- **Form reset**: Form clears after successful submission

## Usage

1. Navigate to `/admin` or click "Admin" in the header
2. Fill out the game information form
3. Add image URLs (at least one recommended)
4. Click "Add Game" to submit
5. Check for success/error message
6. Form will reset automatically on success

## Database Integration
- Games are stored in the Supabase `games` table
- All fields map directly to database columns
- Images are stored as an array of URLs
- Games are automatically set as active (`is_active: true`)
- Timestamps are automatically managed

## Security Note
This is a basic admin panel without authentication. In production, you should add proper authentication and authorization before deploying.

## Troubleshooting
- Ensure Supabase environment variables are properly configured
- Check browser console for detailed error messages
- Verify image URLs are accessible and valid
- Make sure required fields are filled out

## Future Enhancements
- Authentication system
- Edit/delete existing games
- Bulk import functionality
- Image upload instead of URLs
- Preview functionality
- Game status management 