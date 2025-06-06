/**
 * A segment in a path pattern.
 */
interface PathSegment {
  paramName?: string;
  isStatic: boolean;
  isGreedy: boolean;
  isPlus: boolean;
  value: string;
}

/**
 * PathPattern class for matching URL paths against patterns with parameters.
 * Supports Express-style patterns with parameter modifiers.
 */
export class PathPattern {
  private segments: PathSegment[];

  /**
   * Create a new PathPattern instance.
   *
   * @param pattern The pattern string (e.g., "/content/:key", "/content/:path*")
   */
  constructor(private pattern: string) {
    // Normalize the pattern (ensure it starts with /)
    const normalizedPattern = pattern.startsWith("/") ? pattern : "/" + pattern;

    // Parse the pattern into segments
    this.segments = this.parsePatternSegments(normalizedPattern);
  }

  /**
   * Match a path against this pattern.
   *
   * @param path The path to match
   * @returns An object with matched status and extracted parameters
   */
  match(path: string): { matched: boolean; params: Record<string, string> } {
    // Special case for root path
    if (this.pattern === "/" && (path === "/" || path === "")) {
      return { matched: true, params: {} };
    }

    // Normalize the path (ensure it starts with /)
    const normalizedPath = path.startsWith("/") ? path : "/" + path;
    const pathParts = normalizedPath.split("/").filter(Boolean);

    let currentSegmentIndex = 0;
    let currentPathIndex = 0;
    const params: Record<string, string> = {};

    // Skip the first empty segment created by the leading /
    if (this.segments.length > 0 && this.segments[0].value === "")
      currentSegmentIndex++;

    while (currentSegmentIndex < this.segments.length) {
      const segment = this.segments[currentSegmentIndex];

      // Static segment must match exactly
      if (segment.isStatic) {
        if (
          currentPathIndex >= pathParts.length ||
          segment.value !== pathParts[currentPathIndex]
        ) {
          return { matched: false, params: {} };
        }
        currentPathIndex++;
        currentSegmentIndex++;
        continue;
      }

      // Handle parameter segments
      if (segment.paramName) {
        // Greedy parameter (matches rest of path)
        if (segment.isGreedy) {
          // If it's the last segment, consume all remaining path parts
          if (currentSegmentIndex === this.segments.length - 1) {
            const value = pathParts.slice(currentPathIndex).join("/");
            // For * we allow empty matches, for + we require at least one segment
            if (segment.isPlus && value === "") {
              return { matched: false, params: {} };
            }
            params[segment.paramName] = value;
            return { matched: true, params };
          }
          // Greedy parameter in the middle is not fully supported
          // For simplicity, match just one segment
          params[segment.paramName] = pathParts[currentPathIndex] || "";
          currentPathIndex++;
        } else {
          // Regular parameter (matches one segment)
          if (currentPathIndex >= pathParts.length) {
            return { matched: false, params: {} };
          }
          params[segment.paramName] = pathParts[currentPathIndex];
          currentPathIndex++;
        }
      }

      currentSegmentIndex++;
    }

    // If we've consumed all segments but there are still path parts left,
    // it's not a match unless the last segment was greedy
    const lastSegment = this.segments[this.segments.length - 1];
    if (
      currentPathIndex < pathParts.length &&
      !(lastSegment && !lastSegment.isStatic && lastSegment.isGreedy)
    ) {
      return { matched: false, params: {} };
    }

    return { matched: true, params };
  }

  /**
   * Parse a pattern string into segments.
   *
   * @param pattern The pattern string
   * @returns Array of PathSegments
   */
  private parsePatternSegments(pattern: string): PathSegment[] {
    const parts = pattern.split("/");
    return parts.map((part) => {
      // Check if this is a parameter
      if (part.startsWith(":")) {
        let paramName = part.substring(1);
        let isGreedy = false;
        let isPlus = false;

        // Check for modifiers
        if (paramName.endsWith("*")) {
          paramName = paramName.substring(0, paramName.length - 1);
          isGreedy = true;
        } else if (paramName.endsWith("+")) {
          paramName = paramName.substring(0, paramName.length - 1);
          isGreedy = true;
          isPlus = true;
        }

        return {
          paramName,
          isStatic: false,
          isGreedy,
          isPlus,
          value: part,
        };
      }

      // Static segment
      return {
        isStatic: true,
        isGreedy: false,
        isPlus: false,
        value: part,
      };
    });
  }

  /**
   * Get the original pattern string.
   */
  toString(): string {
    return this.pattern;
  }
}
