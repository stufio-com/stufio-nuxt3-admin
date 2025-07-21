// stores/sidebar.ts
import { defineStore } from "pinia";
import {
  Settings2,
  Globe,
  Code,
  Database,
  Shield,
  Mail,
  Layers,
  Users,
  Bell,
  FileText,
  BarChart2,
  ExternalLink,
} from "lucide-vue-next";

// Type definitions
export interface SidebarItem {
  id: string;
  title: string;
  icon: any;
  url: string;
  isActive?: boolean;
  items?: SubItem[];
  order: number;
  module?: string;
}

export interface SubItem {
  id: string;
  title: string;
  url: string;
  isActive?: boolean;
}

export interface FavoriteItem {
  id: string;
  name: string;
  url: string;
  icon: any;
}

export interface Project {
  id: string;
  name: string;
  logo?: any; // Make logo optional
  plan?: string; // Make plan optional
}

export const useSidebarStore = defineStore("sidebar", {
  state: () => ({
    navItems: [] as SidebarItem[],
    favorites: [] as FavoriteItem[],
    projects: [] as Project[],
    loading: false,
    error: null as string | null,
    initialized: false,
  }),

  getters: {
    // No settings-specific getters anymore
  },

  actions: {
    // Update active items based on current route
    updateActiveItems() {
      if (!process.client) return;

      // Use provided route path instead of useRoute()
      const route = useRoute();

      if (!route) return;
      const routePath = route.path;

      this.navItems.forEach((item) => {
        item.isActive =
          routePath === item.url || routePath.startsWith(`${item.url}/`);

        // Also check subitems
        if (item.items) {
          item.items.forEach((subItem) => {
            subItem.isActive =
              routePath === subItem.url ||
              routePath.startsWith(`${subItem.url}/`);
          });
        }
      });
    },

    addNavItem(item: SidebarItem) {
      const existingIndex = this.navItems.findIndex((i) => i.id === item.id);
      if (existingIndex !== -1) {
        this.navItems[existingIndex] = {
          ...this.navItems[existingIndex],
          ...item,
        };
      } else {
        this.navItems.push(item);
        this.navItems.sort((a, b) => a.order - b.order);
      }
    },

    removeNavItem(id: string) {
      const index = this.navItems.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.navItems.splice(index, 1);
      }
    },

    addFavorite(favorite: FavoriteItem) {
      const existingIndex = this.favorites.findIndex(
        (f) => f.id === favorite.id
      );
      if (existingIndex === -1) {
        this.favorites.push(favorite);
      }
    },

    removeFavorite(id: string) {
      const index = this.favorites.findIndex((fav) => fav.id === id);
      if (index !== -1) {
        this.favorites.splice(index, 1);
      }
    },

    setProjects(projects: Project[]) {
      this.projects = projects;
    },

    init() {
      // Default nav items (non-settings)
      this.navItems = [
        ...[
          {
            id: "dashboard",
            title: "Dashboard",
            icon: BarChart2,
            url: "/dashboard",
            isActive: false,
            order: 10,
          },
          {
            id: "content",
            title: "Content",
            icon: FileText,
            url: "#",
            order: 20,
            isActive: false,
            items: [
              { id: "pages", title: "Pages", url: "#" },
              { id: "posts", title: "Posts", url: "#" },
            ],
          },
          {
            id: "users",
            title: "Users",
            icon: Users,
            url: "/users",
            isActive: false,
            order: 30,
          },
          // Settings item will be added by the settings module
        ],
        ...this.navItems,
      ];

      // Default favorites
      this.favorites = [
        {
          id: "dashboard",
          name: "Dashboard",
          url: "/dashboard",
          icon: BarChart2,
        },
        { id: "content", name: "Content", url: "#", icon: FileText },
      ];

      // Default projects with properly imported Layers component
      this.projects = [
        {
          id: "main",
          name: "Main Project",
          logo: Layers,
          plan: "Pro",
        },
      ];

      // Update active items based on current route
      this.updateActiveItems();

      // Set up route change handler for updating active items
      if (process.client) {
        const router = useRouter();
        router.afterEach(() => {
          this.updateActiveItems();
        });
      }

      this.initialized = true;
    },
  },
});
