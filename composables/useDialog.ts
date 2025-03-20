import { useDialogStore, type DialogVariant } from '~/stores/dialog'

export const useDialog = () => {
  const dialogStore = useDialogStore()
  
  // Simple alert dialog
  const alert = (options: {
    title: string,
    message: string,
    buttonText?: string,
    onConfirm?: () => void
  }) => {
    dialogStore.show({
      type: 'alert',
      title: options.title,
      message: options.message,
      buttonText: options.buttonText || 'OK',
      onConfirm: options.onConfirm,
      open: true
    })
  }
  
  // Confirmation dialog
  const confirm = (options: {
    title: string,
    message: string,
    confirmText?: string,
    cancelText?: string,
    variant?: DialogVariant,
    onConfirm: () => void,
    onCancel?: () => void
  }) => {
    dialogStore.show({
      type: 'confirm',
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      variant: options.variant || 'default',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      open: true
    })
  }
  
  // Login dialog
  const login = (options: {
    title?: string,
    message?: string,
    onLogin?: (userData: any) => void,
    onCancel?: () => void,
    redirectTo?: string
  }) => {
    dialogStore.show({
      type: 'login',
      title: options.title || 'Login Required',
      description: 'Enter your credentials to continue',
      message: options.message,
      onLogin: options.onLogin,
      onCancel: options.onCancel,
      redirectTo: options.redirectTo,
      open: true
    })
  }
  
  // Custom form dialog
  const form = (options: {
    title: string,
    description?: string,
    formId: string,
    formComponent: any,
    formProps?: Record<string, any>,
    submitText?: string,
    cancelText?: string,
    onSubmit?: (formData: any) => void | Promise<void>,
    onCancel?: () => void
  }) => {
    dialogStore.show({
      type: 'form',
      title: options.title,
      description: options.description,
      formId: options.formId,
      formComponent: options.formComponent,
      formProps: options.formProps || {},
      submitText: options.submitText || 'Submit',
      cancelText: options.cancelText || 'Cancel',
      onSubmit: options.onSubmit,
      onCancel: options.onCancel,
      open: true
    })
  }
  
  // Message toast-style dialog
  const message = (options: {
    title: string,
    message: string,
    variant?: 'info' | 'success' | 'warning' | 'error',
    autoClose?: boolean,
    autoCloseDelay?: number
  }) => {
    dialogStore.show({
      type: 'message',
      title: options.title,
      message: options.message,
      variant: options.variant || 'info',
      autoClose: options.autoClose ?? true,
      autoCloseDelay: options.autoCloseDelay || 3000,
      open: true
    })
    
    if (options.autoClose !== false) {
      setTimeout(() => {
        dialogStore.hide()
      }, options.autoCloseDelay || 3000)
    }
  }
  
  return {
    alert,
    confirm,
    login,
    form,
    message,
    hide: dialogStore.hide
  }
}