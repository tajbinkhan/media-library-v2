# File Upload Implementation

## Overview

This implementation provides a robust file upload system with the following features:

## Features

### 1. **Upload Configuration**

- **Max file size**: 10MB per file
- **Max files**: 20 files total
- **Max concurrent uploads**: 3 simultaneous uploads
- **Supported formats**: JPEG, PNG, PDF
- **Upload endpoint**: `http://localhost:8080/media/upload`

### 2. **Upload Management**

- **Queue system**: Files are queued and processed automatically
- **Concurrent limiting**: Maximum 3 files uploading simultaneously to manage server load
- **Progress tracking**: Real-time upload progress for each file
- **Status tracking**: pending → uploading → completed/failed/cancelled

### 3. **User Controls**

- **Cancel uploads**: Users can cancel individual file uploads in progress
- **Retry failed uploads**: Failed uploads can be retried individually
- **Remove files**: Files can be removed from the queue before or after upload
- **Clear all**: Option to clear all files and cancel all uploads

### 4. **Status Indicators**

- **Visual status badges**: Color-coded status for each file
- **Progress bars**: Visual progress indication during upload
- **Error messages**: Detailed error messages for failed uploads
- **Upload counts**: Real-time count of pending, uploading, and completed files

## Implementation Details

### File States

- **pending**: File is queued for upload
- **uploading**: File is currently being uploaded
- **completed**: File uploaded successfully
- **failed**: Upload failed (can be retried)
- **cancelled**: Upload was cancelled by user

### Upload Flow

1. Files are dropped or selected
2. Files are validated and added to acceptedFiles/rejectedFiles
3. Accepted files are automatically queued for upload
4. Upload queue processes files respecting concurrent limit
5. Progress is tracked and status updated in real-time
6. Completed/failed files are moved out of active queue

### Server Communication

- **HTTP Method**: POST
- **Content-Type**: multipart/form-data
- **Progress tracking**: Uses Axios upload progress events
- **Cancellation**: Supports upload cancellation via cancel tokens
- **Error handling**: Comprehensive error handling with user-friendly messages

## Usage

The upload system is automatically configured and will start uploading files as soon as they are
accepted. Users can:

1. **Add files**: Drag & drop or click to browse
2. **Monitor progress**: See real-time upload status and progress
3. **Control uploads**: Cancel, retry, or remove files as needed
4. **View results**: See completed uploads and any error messages

## Configuration

Upload settings can be customized in the MediaProvider:

```tsx
<MediaProvider
	initialConfig={{
		maxFiles: 20,
		maxConcurrentUploads: 3,
		maxFileSize: 10 * 1024 * 1024, // 10MB
		uploadUrl: "http://localhost:8080/media/upload"
	}}
>
	<MediaTemplate />
</MediaProvider>
```

## Server Requirements

The upload endpoint should:

- Accept multipart/form-data POST requests
- Return success response with file URL and ID
- Handle file validation and storage
- Return appropriate error messages for failures

Expected response format:

```json
{
	"id": "file-id",
	"url": "file-url",
	"message": "Upload successful"
}
```
