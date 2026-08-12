// prepare input data — populated by load_data() before main() runs
let runs = [];
let suites = [];
let tests = [];
let keywords = [];

async function decode_and_decompress(base64Str) {
    if (base64Str.includes("placeholder_")) return [];
    const bin = atob(base64Str);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const ds = new DecompressionStream('deflate');
    const writer = ds.writable.getWriter();
    writer.write(bytes);   // deliberately not awaited — awaiting here deadlocks
    writer.close();

    const reader = ds.readable.getReader();
    const chunks = [];
    let total = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        total += value.length;
    }

    const out = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.length; }
    chunks.length = 0;   // release the chunk copies before JSON.parse allocates

    return JSON.parse(new TextDecoder().decode(out));
}

// must be awaited before anything reads runs/suites/tests/keywords
async function load_data() {
    runs = await decode_and_decompress("placeholder_runs");
    suites = await decode_and_decompress("placeholder_suites");
    tests = await decode_and_decompress("placeholder_tests");
    keywords = await decode_and_decompress("placeholder_keywords");
}

var unified_dashboard_title = '"placeholder_dashboard_title"'
var message_config = '"placeholder_message_config"'
var force_json_config = "placeholder_force_json_config"
var json_config = "placeholder_json_config"
var filteredAmount = "placeholder_amount"
var filteredAmountDefault = 0
const use_logs = "placeholder_use_logs"
const server = "placeholder_server"
const no_auto_update = "placeholder_no_autoupdate"
if (!message_config.includes("placeholder_message_config")) { message_config = JSON.parse(message_config) }

export {
    runs,
    suites,
    tests,
    keywords,
    load_data,
    message_config,
    force_json_config,
    json_config,
    filteredAmount,
    filteredAmountDefault,
    use_logs,
    server,
    unified_dashboard_title,
    no_auto_update
};
