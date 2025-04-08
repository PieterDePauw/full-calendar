// CurrentTimeIndicator component
export function CurrentTimeIndicator({ currentTimePosition }: { currentTimePosition: number }) {
    return (
        <div className="pointer-events-none absolute right-0 left-0 z-20" style={{ top: `${currentTimePosition}%` }}>
            <div className="relative flex items-center">
                <div className="bg-primary absolute -left-1 h-2 w-2 rounded-full"></div>
                <div className="bg-primary h-[2px] w-full"></div>
            </div>
        </div>
    )
}
