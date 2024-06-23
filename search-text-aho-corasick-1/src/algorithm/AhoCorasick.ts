import { useRef } from "react";
import { Match } from "../model/DFM";

    export default function AhoCorasick() {
        const trie = useRef(new Map([[0, new Map()]]));
        const output = useRef(new Map());
        const fail = useRef(new Map([[0, 0]]));
        const nodeCount = useRef(1);
      
        const patternMatchingMachine = (keywords: string[]) => {
          // Clear existing data
          trie.current = new Map([[0, new Map()]]);
          output.current = new Map();
          fail.current = new Map([[0, 0]]);
          nodeCount.current = 1;

          const localTrie = new Map(trie.current);
          const localOutput = new Map(output.current);
          if(keywords.length > 0) {
            for (const keyword of keywords) {
              let currentNode = 0;
              for (const ch of keyword) {
                if (!localTrie.has(currentNode)) {
                  localTrie.set(currentNode, new Map());
                }
                const children = localTrie.get(currentNode);
        
                if (!children?.has(ch)) {
                  children?.set(ch, nodeCount.current);
                  localTrie.set(nodeCount.current, new Map());
                  nodeCount.current++;
                }
                currentNode = children?.get(ch);
              }
        
              if (!localOutput.has(currentNode)) {
                localOutput.set(currentNode, new Set());
              }
              localOutput.get(currentNode).add(keyword);
            }
          }
          trie.current = localTrie;
          output.current = localOutput;
        };
      
        const buildFailureLinks = () => {
          const queue = [];
          const localTrie = new Map(trie.current);
          const localFail = new Map(fail.current);
          const localOutput = new Map(output.current);
      
          const rootChildren = localTrie.get(0);
          if (rootChildren) {
            for (const [, node] of rootChildren) {
              queue.push(node);
              localFail.set(node, 0);
            }
          }
      
          while (queue.length > 0) {
            const currentNode = queue.shift();
            const currentNodeMap = localTrie.get(currentNode);
      
            if (currentNodeMap) {
              for (const [ch, childNode] of currentNodeMap.entries()) {
                queue.push(childNode);
                let failNode = localFail.get(currentNode);
      
                while (failNode !== 0 && (!localTrie.get(failNode!) || !localTrie.get(failNode!)!.has(ch))) {
                  failNode = localFail.get(failNode!);
                }
      
                if (localTrie.get(failNode!)?.has(ch)) {
                  localFail.set(childNode, localTrie.get(failNode!)!.get(ch));
                } else {
                  localFail.set(childNode, 0);
                }
      
                const fallBack = localFail.get(childNode);
                if (fallBack !== undefined && localOutput.has(fallBack)) {
                  const childNodeSet = localOutput.get(childNode) || new Set<number>();
                  const fallBackSet = localOutput.get(fallBack);
                  fallBackSet.forEach((item: number) => childNodeSet.add(item));
                  localOutput.set(childNode, childNodeSet);
                }
              }
            }
          }
          fail.current = localFail;
          output.current = localOutput;
        };
      
        const search = (text: string) => {
          const matches: Match[] = [];
          const keywordCounts = new Map();
          const localTrie = trie.current;
          const localOutput = output.current;
          const localFail = fail.current;
      
          let currentNode = 0;
          for (let i = 0; i < text.length; i++) {
            const ch = text[i];
      
            while (currentNode !== 0 && !(localTrie.get(currentNode)?.has(ch))) {
              currentNode = localFail.get(currentNode) || 0;
            }
      
            if (localTrie.get(currentNode)?.has(ch)) {
              currentNode = localTrie.get(currentNode!)!.get(ch);
      
              if (localOutput.has(currentNode)) {
                const keywords = localOutput.get(currentNode);
                keywords.forEach((keyword: string) => {
                  const currentCount = keywordCounts.get(keyword) || 0;
                  keywordCounts.set(keyword, currentCount + 1);
                  matches.push({ keyword, index: i });
                });
              }
            } else {
              currentNode = 0;
            }
          }
          return matches;
        };
      
        return { patternMatchingMachine, buildFailureLinks, search };
    }