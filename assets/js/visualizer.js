/**
 * WooCommerce Block Visualizer
 *
 * Detects and highlights WooCommerce block components on the page,
 * showing their class names for easier CSS targeting.
 */
( function() {
	'use strict';

	const VISUALIZER_ATTR = 'data-wc-visualizer';
	const LABEL_CLASS = 'wc-block-visualizer-label';

	let isEnabled = true;
	let currentDepth = 1;

	/**
	 * List of class prefixes to match.
	 */
	const WC_CLASS_PREFIXES = [
		'wc-block-',
		'wp-block-woocommerce-',
	];

	/**
	 * Check if a class name is a WooCommerce block class.
	 *
	 * @param {string} className Class name to check.
	 * @return {boolean} True if it's a wc-block class.
	 */
	function isWcBlockClass( className ) {
		if ( className === LABEL_CLASS ) {
			return false;
		}
		return WC_CLASS_PREFIXES.some( function( prefix ) {
			return className.startsWith( prefix );
		} );
	}

	/**
	 * Check if an element has WooCommerce block classes.
	 *
	 * @param {Element} element DOM element.
	 * @return {boolean} True if element has wc-block classes.
	 */
	function isWcBlockElement( element ) {
		if ( ! element || ! element.classList ) {
			return false;
		}
		return Array.from( element.classList ).some( isWcBlockClass );
	}

	/**
	 * Get the depth of a wc-block element (how many wc-block ancestors it has).
	 *
	 * @param {Element} element DOM element.
	 * @return {number} Depth level (1 = top-level, 2 = one ancestor, etc.).
	 */
	function getElementDepth( element ) {
		let depth = 1;
		let parent = element.parentElement;

		while ( parent ) {
			if ( isWcBlockElement( parent ) ) {
				depth++;
			}
			parent = parent.parentElement;
		}

		return depth;
	}

	/**
	 * Get all WooCommerce block class names from an element.
	 *
	 * @param {Element} element DOM element.
	 * @return {Array} Array of matching class names.
	 */
	function getWcBlockClasses( element ) {
		const classes = Array.from( element.classList );
		return classes.filter( isWcBlockClass );
	}

	/**
	 * Get the primary class name for labeling.
	 * Prefers wc-* classes over wp-* classes.
	 *
	 * @param {Array} classes Array of class names.
	 * @return {string} Primary class name.
	 */
	function getPrimaryClass( classes ) {
		// Prefer wc-block-components-* classes first.
		const componentClass = classes.find( function( c ) {
			return c.startsWith( 'wc-block-components-' );
		} );
		if ( componentClass ) {
			return componentClass;
		}

		// Then prefer any wc-* class over wp-* class.
		const wcClass = classes.find( function( c ) {
			return c.startsWith( 'wc-' );
		} );
		if ( wcClass ) {
			return wcClass;
		}

		// Fall back to first class.
		return classes[ 0 ];
	}

	/**
	 * Get color based on class type.
	 *
	 * @param {string} className The class name.
	 * @return {string} Color for the highlight.
	 */
	function getClassColor( className ) {
		if ( className.startsWith( 'wc-block-components-' ) ) {
			return 'blue';
		}
		if ( className.startsWith( 'wp-block-woocommerce-' ) ) {
			return 'green';
		}
		return 'pink';
	}

	/**
	 * Find the top-most wc-block parent element.
	 *
	 * @param {Element} element DOM element.
	 * @return {Element|null} Top-most parent with wc-block class, or null.
	 */
	function getTopParent( element ) {
		let topParent = null;
		let current = element.parentElement;

		while ( current ) {
			if ( isWcBlockElement( current ) ) {
				topParent = current;
			}
			current = current.parentElement;
		}

		return topParent;
	}

	/**
	 * Build a CSS selector with just the top parent and current element.
	 *
	 * @param {Element} element DOM element.
	 * @return {string} CSS selector chain.
	 */
	function buildSelectorChain( element ) {
		const selectors = [];

		// Get current element's class.
		const wcClasses = getWcBlockClasses( element );
		if ( wcClasses.length > 0 ) {
			const primaryClass = getPrimaryClass( wcClasses );
			selectors.unshift( '.' + primaryClass );
		}

		// Get top-most parent's class.
		const topParent = getTopParent( element );
		if ( topParent ) {
			const parentClasses = getWcBlockClasses( topParent );
			if ( parentClasses.length > 0 ) {
				const parentClass = getPrimaryClass( parentClasses );
				selectors.unshift( '.' + parentClass );
			}
		}

		return selectors.join( ' ' );
	}

	/**
	 * Copy CSS selector to clipboard.
	 *
	 * @param {Element} element The element to build selector for.
	 * @param {boolean} includeParent Whether to include the parent selector.
	 */
	function copySelectorToClipboard( element, includeParent ) {
		let cssRule;

		const wcClasses = getWcBlockClasses( element );
		const primaryClass = getPrimaryClass( wcClasses );

		if ( includeParent ) {
			const topParent = getTopParent( element );
			if ( topParent ) {
				const parentClasses = getWcBlockClasses( topParent );
				const parentClass = getPrimaryClass( parentClasses );
				cssRule = '.' + parentClass + ' {\n\t.' + primaryClass + ' {\n\t\t\n\t}\n}';
			} else {
				cssRule = '.' + primaryClass + ' {\n\t\n}';
			}
		} else {
			cssRule = '.' + primaryClass + ' {\n\t\n}';
		}

		navigator.clipboard.writeText( cssRule ).then( function() {
			console.log( 'WC Block Visualizer: Copied selector\n' + cssRule );
		} );
	}

	/**
	 * Create a label element for a class name.
	 *
	 * @param {string} className The class name to display.
	 * @param {number} depth The depth level of the element.
	 * @param {Element} targetElement The element this label is for.
	 * @return {Element} Label element.
	 */
	function createLabel( className, depth, targetElement ) {
		const label = document.createElement( 'span' );
		label.className = LABEL_CLASS;
		label.textContent = '[' + depth + '] ' + className;
		label.setAttribute( 'data-color', getClassColor( className ) );

		// Click to copy selector (Cmd+click includes parent).
		label.style.cursor = 'pointer';
		label.style.pointerEvents = 'auto';
		label.addEventListener( 'click', function( event ) {
			event.stopPropagation();
			copySelectorToClipboard( targetElement, event.metaKey );

			// Visual feedback.
			const originalText = label.textContent;
			label.textContent = event.metaKey ? 'Copied with parent!' : 'Copied!';
			setTimeout( function() {
				label.textContent = originalText;
			}, 1000 );
		} );

		return label;
	}

	/**
	 * Process a single element for visualization.
	 *
	 * @param {Element} element DOM element to process.
	 */
	function processElement( element ) {
		// Skip our own label elements.
		if ( element.classList.contains( LABEL_CLASS ) ) {
			return;
		}

		const wcClasses = getWcBlockClasses( element );
		if ( wcClasses.length === 0 ) {
			return;
		}

		const depth = getElementDepth( element );

		// Only show elements at exactly the current depth.
		if ( depth !== currentDepth ) {
			return;
		}

		// Skip if already processed.
		if ( element.hasAttribute( VISUALIZER_ATTR ) ) {
			return;
		}

		const primaryClass = getPrimaryClass( wcClasses );
		const color = getClassColor( primaryClass );

		// Mark as processed.
		element.setAttribute( VISUALIZER_ATTR, 'true' );
		element.setAttribute( 'data-wc-visualizer-color', color );

		// Add position relative if needed for label positioning.
		const computedStyle = window.getComputedStyle( element );
		if ( computedStyle.position === 'static' ) {
			element.style.position = 'relative';
		}

		// Create and append label.
		const label = createLabel( primaryClass, depth, element );
		element.appendChild( label );
	}

	/**
	 * Find and process all WooCommerce block elements.
	 */
	function processAllElements() {
		if ( ! isEnabled ) {
			return;
		}

		// Find all elements with wc-block classes.
		const selector = '[class*="wc-block-"], [class*="wp-block-woocommerce-"]';
		const elements = document.querySelectorAll( selector );

		elements.forEach( function( element ) {
			processElement( element );
		} );
	}

	/**
	 * Remove all visualizer elements.
	 */
	function removeVisualizer() {
		// Remove labels.
		document.querySelectorAll( '.' + LABEL_CLASS ).forEach( function( label ) {
			label.remove();
		} );

		// Remove attributes.
		document.querySelectorAll( '[' + VISUALIZER_ATTR + ']' ).forEach( function( element ) {
			element.removeAttribute( VISUALIZER_ATTR );
			element.removeAttribute( 'data-wc-visualizer-color' );
		} );
	}

	/**
	 * Refresh the visualizer (clear and re-render at current depth).
	 */
	function refreshVisualizer() {
		removeVisualizer();
		if ( isEnabled ) {
			processAllElements();
		}
	}

	/**
	 * Toggle the visualizer on/off.
	 */
	function toggleVisualizer() {
		isEnabled = ! isEnabled;

		if ( isEnabled ) {
			processAllElements();
		} else {
			removeVisualizer();
		}

		console.log( 'WC Block Visualizer: ' + ( isEnabled ? 'ON' : 'OFF' ) );

		// Update cookie for persistence.
		document.cookie = 'wc_block_visualizer=' + ( isEnabled ? '1' : '0' ) + '; path=/';
	}

	/**
	 * Increase depth level.
	 */
	function increaseDepth() {
		currentDepth++;
		console.log( 'WC Block Visualizer: Depth ' + currentDepth );
		refreshVisualizer();
	}

	/**
	 * Decrease depth level.
	 */
	function decreaseDepth() {
		if ( currentDepth > 1 ) {
			currentDepth--;
			console.log( 'WC Block Visualizer: Depth ' + currentDepth );
			refreshVisualizer();
		}
	}

	/**
	 * Initialize the visualizer.
	 */
	function init() {
		// Initial scan.
		processAllElements();
		console.log( 'WC Block Visualizer: Ready (Depth ' + currentDepth + ')' );

		// Keyboard shortcuts (Cmd+Shift on Mac).
		document.addEventListener( 'keydown', function( event ) {
			if ( event.metaKey && event.shiftKey ) {
				if ( event.key === 'v' || event.key === 'V' ) {
					// Cmd+Shift+V: Toggle visualizer on/off.
					event.preventDefault();
					toggleVisualizer();
				} else if ( event.key === 's' || event.key === 'S' ) {
					// Cmd+Shift+S: Rescan for new elements.
					event.preventDefault();
					processAllElements();
					console.log( 'WC Block Visualizer: Rescanned (Depth ' + currentDepth + ')' );
				} else if ( event.key === 'ArrowUp' ) {
					// Cmd+Shift+Up: Increase depth.
					event.preventDefault();
					increaseDepth();
				} else if ( event.key === 'ArrowDown' ) {
					// Cmd+Shift+Down: Decrease depth.
					event.preventDefault();
					decreaseDepth();
				}
			}
		} );
	}

	// Start when DOM is ready.
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
