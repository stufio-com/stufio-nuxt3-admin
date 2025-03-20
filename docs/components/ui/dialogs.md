# Dialog System

A global dialog system for Stufio Admin that provides consistent user interfaces for alerts, confirmations, login forms, and custom forms.

## Features

- Global store-based approach - no need to add dialog components to every page
- Typesafe API through composables
- Support for multiple dialog types:
  - Alert dialogs
  - Confirmation dialogs
  - Login dialogs
  - Custom form dialogs
  - Message notifications

## Basic Usage

The dialog system is available through the `useDialog` composable:

```typescript
import { useDialog } from '~/composables/useDialog'

const dialog = useDialog()

// Show an alert
dialog.alert({
  title: 'Information',
  message: 'Your changes have been saved.',
  buttonText: 'OK'
})
```

## Dialog Types

### Alert Dialog

Simple alert dialogs for showing information to the user.

```typescript
dialog.alert({
  title: 'Success',
  message: 'Your profile has been updated.',
  buttonText: 'Great!', // Optional, defaults to 'OK'
  onConfirm: () => {
    // Optional callback when the user confirms
    console.log('User acknowledged the alert')
  }
})
```

### Confirmation Dialog

Asks the user to confirm or cancel an action.

```typescript
dialog.confirm({
  title: 'Delete Item',
  message: 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText: 'Delete', // Optional, defaults to 'Confirm'
  cancelText: 'Cancel', // Optional, defaults to 'Cancel'
  variant: 'destructive', // Optional, can be 'default', 'destructive', etc.
  onConfirm: () => {
    // Code to execute when the user confirms
    deleteItem(itemId)
  },
  onCancel: () => {
    // Optional callback when the user cancels
    console.log('User canceled the deletion')
  }
})
```

### Login Dialog

Shows a login form, useful for authentication prompts.

```typescript
dialog.login({
  title: 'Authentication Required',
  message: 'Please log in to continue.',
  onLogin: (userData) => {
    // Code to execute after successful login
    console.log('User logged in:', userData)
    fetchProtectedData()
  },
  onCancel: () => {
    // Optional callback when the user cancels the login
    console.log('User canceled login')
  },
  redirectTo: '/dashboard' // Optional path to redirect after successful login
})
```

### Form Dialog

Displays a custom form using a dynamic component.

```typescript
dialog.form({
  title: 'Create New User',
  description: 'Fill out the form to create a new user account.',
  formId: 'create-user-form',
  formComponent: resolveComponent('UserForm'), // Component to render
  formProps: {
    // Props to pass to the component
    roles: ['admin', 'editor', 'user'],
    departments: departmentsList
  },
  submitText: 'Create User', // Optional, defaults to 'Submit'
  cancelText: 'Cancel', // Optional, defaults to 'Cancel'
  onSubmit: async (formData) => {
    // Handle form submission
    await createUser(formData)
  }
})
```

### Message Dialog

Shows a toast-style message that optionally auto-closes.

```typescript
dialog.message({
  title: 'Success',
  message: 'File uploaded successfully.',
  variant: 'success', // 'info', 'success', 'warning', or 'error'
  autoClose: true, // Optional, defaults to true
  autoCloseDelay: 3000 // Optional, defaults to 3000ms
})
```

## Advanced Usage

### Protected API Requests

The dialog system integrates with the `useApiWithAuth` composable to handle authentication challenges:

```typescript
// Example of fetching protected data
async function fetchUserProfile() {
  try {
    const { data, error } = await useApiWithAuth('/api/v1/users/me')
    
    if (data.value) {
      return data.value
    }
  } catch (err) {
    console.error('Failed to fetch profile:', err)
    // If authentication failed, a login dialog will be shown automatically
  }
}
```

### Sequential Dialogs

You can chain dialogs for multi-step interactions:

```typescript
async function deleteUserWorkflow(userId) {
  dialog.confirm({
    title: 'Delete User',
    message: 'Are you sure you want to delete this user?',
    variant: 'destructive',
    onConfirm: async () => {
      try {
        await deleteUser(userId)
        
        dialog.message({
          title: 'Success',
          message: 'User has been deleted.',
          variant: 'success'
        })
      } catch (err) {
        dialog.alert({
          title: 'Error',
          message: `Failed to delete user: ${err.message}`,
          variant: 'error'
        })
      }
    }
  })
}
```

