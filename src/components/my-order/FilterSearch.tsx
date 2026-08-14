import { Search } from 'lucide-react'
import React from 'react'

const FilterSearch = ({ activeTab, searchQuery, setActiveTab, setSearchQuery }: { activeTab: string; searchQuery: string; setActiveTab: (tab: string) => void; setSearchQuery: (query: string) => void }) => {
  return (
    <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1 text-xs font-medium">
                  {[
                    { id: "all", label: "All Orders" },
                    { id: "processing", label: "Processing" },
                    { id: "unpaid", label: "Unpaid" },
                    { id: "delivered", label: "Delivered" },
                    { id: "cancelled", label: "Cancelled" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-md px-3 py-1.5 transition-colors ${
                        activeTab === tab.id
                          ? "bg-background font-semibold text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
        
                <div className="relative min-w-55 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search reference or item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
    </div>
  )
}

export default FilterSearch