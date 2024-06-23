import { useEffect, useRef, useState } from "react";
import { Match } from "./model/DFM";
import AhoCorasick from "./algorithm/AhoCorasick";

function App() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [text, setText] = useState<string>('');
  const [results, setResults] = useState<Match[]>([]);
  const keywordInputRef = useRef<string>('');

  const ahoCorasick = AhoCorasick();

  const searchText = () => {
    ahoCorasick.patternMatchingMachine(keywords);
    ahoCorasick.buildFailureLinks();
    const searchResults = ahoCorasick.search(text);
    setResults(searchResults);
  };

  const fileReadHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const content = reader.result as string;
        setText(content);
        searchText();
      };
      reader.readAsText(file);
    }
  };

  const inputKeywordsHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const inputValue = (event.target as HTMLInputElement).value;
      const keywordsArray = inputValue.split(',').map(keyword => keyword.trim());
      setKeywords(keywordsArray);
    } else {
      keywordInputRef.current = (event.target as HTMLInputElement).value;
    }
  };

  const highlightText = () => {
    if (!results.length) return text;

    const segments: JSX.Element[] = [];
    let lastIndex = 0;

    results.forEach((result, index) => {
      const { keyword, index: endIndex } = result;
      const startIndex = endIndex - keyword.length + 1;

      if (startIndex > lastIndex) {
        segments.push(
          <span key={`text-${index}`}>{text.slice(lastIndex, startIndex)}</span>
        );
      }

      segments.push(
        <span key={`highlight-${index}`} style={{ backgroundColor: 'yellow' }}>
          {text.slice(startIndex, endIndex + 1)}
        </span>
      );

      lastIndex = endIndex + 1;
    });

    if (lastIndex < text.length) {
      segments.push(
        <span key="text-end">{text.slice(lastIndex)}</span>
      );
    }

    return segments;
  };

  useEffect(() => {
    searchText();
  }, [keywords]);

  return (
    <>
      <h1>Aho-Corasick Implementation</h1>
      <input type="file" onChange={fileReadHandler} />
      <p>File content:</p>
      <input
        placeholder="Search..."
        onKeyDown={inputKeywordsHandler}
      />
      <div style={{
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        maxHeight: '400px',
        overflowY: 'auto',
        border: '1px solid #ccc',
        padding: '10px',
        background: '#f5f5f5'
      }}>
        {highlightText()}
      </div>
      <h3>Total No of Times String '{keywords}' found = {results.length} </h3>
    </>
  )
}

export default App;
