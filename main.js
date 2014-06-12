/*
    initflashfiles.txt parse/process script
    Written by HKPR Katya B. E.
    
    This script released under MIT License.
*/

var fs   = require('fs'),
    path = require('path');

try {
    var Iconv = require('iconv').Iconv,
        u16_conv = new Iconv("UTF-16", "UTF-8");
} catch (error) {
    console.log(
      "[!] Can't find iconv module. please install iconv module.\n" +
      "    'npm install iconv'"
    );
    return;
}

var iff_path;
if (process.argv[2]) {
    iff_path = process.argv[2];
} else if (fs.existsSync(process.cwd() + "/initflashfiles.txt")) {
    iff_path = process.cwd() + "/initflashfiles.txt";
} else {
    console.log("[!] Please input 'initflashfiles.txt' path.");
    return false;
}

var work_dir = path.dirname(iff_path);

var output_dir;
if (process.argv[3]) {
    output_dir = process.argv[3];
} else {
    output_dir = work_dir + "\\Device";
    if (!fs.existsSync(output_dir)) {
        fs.mkdirSync(output_dir);
    }
}

var iff_buf  = fs.readFileSync(iff_path),
    iff      = u16_conv.convert(iff_buf).toString('utf8');

if (iff.length < 1) {
    console.log("[!] file is blank.");
    return;
}

var iff_arr = iff.split('\n');

for (var idx in iff_arr) {
    var line = iff_arr[idx];
    
    if (line.length <= 0 || line.substr(0, 1) == ";") { continue; }
    
    var match = line.match(/Directory\(\"(.*)\"\):-File\(\"(.*)\",\"(.*)\"\)/);
    if (!match) { continue; }
    
    var dir_arr = match[1].split("\\"),
        c_path  = output_dir;
    
    for (var idx2 in dir_arr) {
        if (dir_arr[idx2].length > 0) {
            c_path += "\\" + dir_arr[idx2];
            
            if (!fs.existsSync(c_path)) {
                fs.mkdirSync(c_path);
            }
        }
    }
    
    var in_path  = work_dir + "\\" + path.basename(match[3]),
        out_path = output_dir + match[1] + "\\" + path.basename(match[2]);
    
    if (fs.existsSync(in_path)) {
        console.log("[+] " + path.basename(match[3]) + " -> " + path.basename(match[2]));
        fs.renameSync(in_path, out_path);
    }
}
