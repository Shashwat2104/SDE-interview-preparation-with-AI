import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-noconflict/theme-monokai";

const AnswerInput = ({
  codeAnswer,
  setCodeAnswer,
  textAnswer,
  setTextAnswer,
  editorTheme,
  isRecording,
  startRecording,
  stopRecording,
  transcript,
  isListening,
}) => {
  const getEditorMode = () => "javascript";

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8">
        Your Answer:
      </h2>
      <div className="mb-4">
        <AceEditor
          mode={getEditorMode()}
          theme={editorTheme}
          value={codeAnswer}
          onChange={setCodeAnswer}
          name="answer-editor"
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
            fontSize: 22,
          }}
          width="100%"
          height="240px"
          className="rounded-lg text-2xl"
        />
      </div>
      <div className="mb-4">
        <textarea
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder="Type your explanation here..."
          className="w-full h-40 bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl"
        />
      </div>
      <div className="mt-4 flex gap-4">
        {!isRecording && (
          <button
            onClick={startRecording}
            className="px-4 py-2 rounded-lg font-medium transition-all bg-blue-500 hover:bg-blue-600"
          >
            Start Recording
          </button>
        )}
        {isRecording && (
          <button
            onClick={stopRecording}
            className="px-4 py-2 rounded-lg font-medium transition-all bg-red-500 hover:bg-red-600"
          >
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default AnswerInput;
