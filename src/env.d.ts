declare global {
	interface Window {
		/** Points the tab icon at the mark for the given theme. Defined by the
		 *  pre-paint inline script in Layout.astro, called from Nav's theme sync;
		 *  optional because module scripts can run before it in edge cases. */
		__syncFavicon?: (theme?: string) => void;
	}
}

export {};
