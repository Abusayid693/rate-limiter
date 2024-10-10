export default function Example({ smsSentLastMinute, smsSentToday }: any) {
  return (
    <div className="container m-auto  w-[900px]">
      <div className="flex flex-col w-full ">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 my-2 w-full">
          <div className="metric-card bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 max-w-72 w-full">
            <a
              aria-label="YouTube Subscribers"
              target="_blank"
              rel="noopener noreferrer"
              href="https://stackdiary.com/"
            >
              <div className="flex items-center text-gray-900 dark:text-gray-100">
                Today
              </div>
            </a>
            <p className="mt-2 text-3xl font-bold spacing-sm text-black dark:text-white">
              {smsSentToday}
            </p>
          </div>
          <div className="metric-card bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 max-w-72 w-full">
            <a
              aria-label="YouTube Views"
              target="_blank"
              rel="noopener noreferrer"
              href="https://stackdiary.com/"
            >
              <div className="flex items-center text-gray-900 dark:text-gray-100">
                Last 1 min
              </div>
            </a>
            <p className="mt-2 text-3xl font-bold spacing-sm text-black dark:text-white">
              {smsSentLastMinute}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
