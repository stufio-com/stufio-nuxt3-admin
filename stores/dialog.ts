import { defineStore } from 'pinia'

export type DialogType = 'alert' | 'confirm' | 'login' | 'form' | 'message'
export type DialogVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'

interface BaseDialogOptions {
  type: DialogType
  title: string
  description?: string
  open: boolean
}

interface AlertDialogOptions extends BaseDialogOptions {
  type: 'alert'
  message: string
  buttonText?: string
  onConfirm?: () => void
}

interface ConfirmDialogOptions extends BaseDialogOptions {
  type: 'confirm'
  message: string
  confirmText?: string
  cancelText?: string
  variant?: DialogVariant
  onConfirm: () => void
  onCancel?: () => void
}

interface LoginDialogOptions extends BaseDialogOptions {
  type: 'login'
  message?: string
  onLogin?: (userData: any) => void
  onCancel?: () => void
  redirectTo?: string
}

interface FormDialogOptions extends BaseDialogOptions {
  type: 'form'
  formId: string
  formComponent: any
  formProps?: Record<string, any>
  submitText?: string
  cancelText?: string
  onSubmit?: (formData: any) => void | Promise<void>
  onCancel?: () => void
}

interface MessageDialogOptions extends BaseDialogOptions {
  type: 'message'
  message: string
  variant?: 'info' | 'success' | 'warning' | 'error'
  autoClose?: boolean
  autoCloseDelay?: number
}

export type DialogOptions = 
  | AlertDialogOptions 
  | ConfirmDialogOptions 
  | LoginDialogOptions 
  | FormDialogOptions
  | MessageDialogOptions

export const useDialogStore = defineStore('dialog', {
  state: () => ({
    dialog: null as DialogOptions | null,
    isLoading: false
  }),
  
  actions: {
    show(options: DialogOptions) {
      this.dialog = { 
        ...options,
        open: true 
      }
    },
    
    hide() {
      if (this.dialog) {
        this.dialog.open = false
        // Allow animations to complete before removing dialog data
        setTimeout(() => {
          this.dialog = null
        }, 300)
      }
    },
    
    setLoading(loading: boolean) {
      this.isLoading = loading
    }
  }
})