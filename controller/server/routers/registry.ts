import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

// Zod schemas for registry validation
const zRegistryItem = z.object({
  id: z.string(),
  type: z.enum(['script', 'template', 'workcell', 'workflow']),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  author: z.string(),
  tags: z.array(z.string()),
  downloadUrl: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  compatibility: z.string().optional(),
  featured: z.boolean().optional(),
});

const zRegistry = z.object({
  version: z.string(),
  lastUpdated: z.string(),
  items: z.array(zRegistryItem),
});

// Type exports for use in components
export type RegistryItem = z.infer<typeof zRegistryItem>;
export type Registry = z.infer<typeof zRegistry>;

const REGISTRY_URL = process.env.GALAGO_REGISTRY_URL || 
                     'https://galago.bio/galago-docs/registry.json';
console.log('Using registry URL:', REGISTRY_URL);
export const registryRouter = router({
  // Get the full registry
  getRegistry: procedure.query(async () => {
    try {
      const response = await fetch(REGISTRY_URL, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!response.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch registry: ${response.status}`,
        });
      }

      const data = await response.json();
      
      // Validate the response
      const validatedData = zRegistry.parse(data);
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Invalid registry data format',
          cause: error,
        });
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch registry',
      });
    }
  }),

  // Get a specific registry item by ID
  getRegistryItem: procedure
    .input(z.string())
    .query(async ({ input: itemId }) => {
      try {
        const response = await fetch(REGISTRY_URL);

        if (!response.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch registry: ${response.status}`,
          });
        }

        const data = await response.json();
        const registry = zRegistry.parse(data);
        
        const item = registry.items.find(item => item.id === itemId);
        
        if (!item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Registry item with id ${itemId} not found`,
          });
        }

        return item;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch registry item',
        });
      }
    }),
  // Search registry items
  searchRegistry: procedure
    .input(
      z.object({
        query: z.string().optional(),
        type: z.enum(['script', 'template', 'workcell', 'workflow']).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await fetch(REGISTRY_URL);

        if (!response.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch registry: ${response.status}`,
          });
        }

        const data = await response.json();
        const registry = zRegistry.parse(data);
        
        let filteredItems = registry.items;

        // Filter by search query
        if (input.query) {
          const lowerQuery = input.query.toLowerCase();
          filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(lowerQuery) ||
            item.description.toLowerCase().includes(lowerQuery) ||
            item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
          );
        }

        // Filter by type
        if (input.type) {
          filteredItems = filteredItems.filter(item => item.type === input.type);
        }

        // Filter by tags
        if (input.tags && input.tags.length > 0) {
          filteredItems = filteredItems.filter(item =>
            input.tags!.every(tag => item.tags.includes(tag))
          );
        }

        return {
          ...registry,
          items: filteredItems,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to search registry',
        });
      }
    }),

  // Get all unique tags from the registry
  getTags: procedure.query(async () => {
    try {
      const response = await fetch(REGISTRY_URL);

      if (!response.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch registry: ${response.status}`,
        });
      }

      const data = await response.json();
      const registry = zRegistry.parse(data);
      
      const tagsSet = new Set<string>();
      registry.items.forEach(item => {
        item.tags.forEach(tag => tagsSet.add(tag));
      });

      return Array.from(tagsSet).sort();
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch tags',
      });
    }
  }),

  // Download a specific registry item's content
 downloadItem: procedure
    .input(z.string())
    .mutation(async ({ input: itemId }) => {
      try {
        // First, get the item to find its download URL
        const registryResponse = await fetch(REGISTRY_URL);
        if (!registryResponse.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to fetch registry: ${registryResponse.status}`,
          });
        }

        const registryData = await registryResponse.json();
        const registry = zRegistry.parse(registryData);
        
        const item = registry.items.find(i => i.id === itemId);
        if (!item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Registry item with id ${itemId} not found`,
          });
        }

        // Fetch the actual item content
        const itemResponse = await fetch(item.downloadUrl);
        if (!itemResponse.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to download item: ${itemResponse.status}`,
          });
        }

        let itemContent;
        const isJsonFile = item.downloadUrl.endsWith('.json');

        if (isJsonFile) {
            itemContent = await itemResponse.json();
        } else {
            itemContent = await itemResponse.text();
        }

        return {
            item,
            content: itemContent,
            contentType: isJsonFile ? 'json' : 'text'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to download item',
        });
      }
    }),

  // Get featured items
  getFeaturedItems: procedure.query(async () => {
    try {
      const response = await fetch(REGISTRY_URL);

      if (!response.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch registry: ${response.status}`,
        });
      }

      const data = await response.json();
      const registry = zRegistry.parse(data);
      
      const featuredItems = registry.items.filter(item => item.featured === true);

      return {
        ...registry,
        items: featuredItems,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch featured items',
      });
    }
  }),
});