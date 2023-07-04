export function getDomTreeDepth(
  root: Node,
  nodeFilter?: (node: Node) => boolean
): number {
  let queue = [root];

  let level = 0;

  const forEachNode = (node: Node) => {
    node.childNodes.forEach(child => {
      if (child) {
        if (nodeFilter && !nodeFilter(node)) {
          return;
        }
        queue.unshift(child);
      }
    });
  };

  while (queue.length > 0) {
    const currentQueue = queue;
    queue = [];

    currentQueue.forEach(forEachNode);

    level += 1;
  }

  return level;
}
