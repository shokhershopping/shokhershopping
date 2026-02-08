export function convertToPrismaWhereClause(queryString: string) {
    // Trim the string and handle edge cases for extra spaces or misplaced operators
    const trimmedQuery = queryString.trim();

    // Use regular expressions to capture different logical blocks (OR and AND conditions)
    const orSegments = trimmedQuery
        .split(/\s*\|\|\s*/)
        .map((segment) => segment.trim());

    // Initialize the final Prisma where clause object
    const prismaWhereClause = {
        OR: orSegments.map((segment) => {
            // If the segment has parentheses, it indicates an AND group
            if (segment.startsWith('(') && segment.endsWith(')')) {
                // Remove the parentheses and split by '&' for AND conditions
                const andConditions = segment
                    .slice(1, -1)
                    .split('&')
                    .map((condition) => {
                        const [key, value] = condition.split('=');
                        if (key && value) {
                            return { [key]: value }; // Return key-value pair for Prisma query
                        }
                    })
                    .filter(Boolean); // Filter out any empty conditions
                return andConditions.length === 1
                    ? andConditions[0]
                    : { AND: andConditions };
            } else {
                // For segments without parentheses, just return as individual conditions
                const conditions = segment
                    .split('&')
                    .map((condition) => {
                        const [key, value] = condition.split('=');
                        if (key && value) {
                            return { [key]: value }; // Return key-value pair for Prisma query
                        }
                    })
                    .filter(Boolean); // Filter out any empty conditions
                return conditions.length === 1
                    ? conditions[0]
                    : { AND: conditions };
            }
        }),
    };

    return prismaWhereClause;
}

// Example usage:
const queryString = '(category=electronics&status=active)||limit=10&page=1';
const prismaWhereClause = convertToPrismaWhereClause(queryString);

console.log(JSON.stringify(prismaWhereClause, null, 2));
