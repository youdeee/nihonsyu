(async function () {
  alert(await getText())
})();


async function getText() {
  let content = ''
  const text = window.getSelection().toString();
  const csv = await getCsv();
  for (let i = 0; i < csv.length; i++) {
    if (csv[i].match(text)) {
      const d = csv[i].split(',')
      const c = `${d[2]}${d[3]} ${d[4]}\n${d[1]}\n${d[5]} ${d[6]}`
      if (content) {
        content = `${content}\n\n${c}`
      } else {
        content = c
      }
    }
  }
  return content === '' ? '該当する情報がありません' : content
}
// async function getText() {
//   const text = window.getSelection().toString();
//   const data = await getData();
//   return data[text] ?? '該当する情報がありません'
// }

async function getCsv() {
  const csvFileUrl = chrome.runtime.getURL('nihonsyuranking.csv');
  try {
    const response = await fetch(csvFileUrl);
    const csvString = await response.text();
    return csvString.trim().split('\n')
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function getData() {
  const csvFileUrl = chrome.runtime.getURL('nihonsyuranking.csv');
  try {
    const response = await fetch(csvFileUrl);
    const csvString = await response.text();
    const csv = csvString.trim().split('\n')
                         .map(line => line.split(',').map(x => x.trim()));
    const data = {}
    for (let i = 0; i < csv.length; i++) {
      const d = csv[i]
      const name = d[0]
      let text = `${d[2]}${d[3]} ${d[4]}\n${d[1]}\n${d[5]} ${d[6]}`
      if (data[name]) {
        data[name] = `${data[name]}\n\n${text}`
      } else {
        data[name] = text
      }
    }
    return data
  } catch (error) {
    console.log(error);
    return {};
  }
}
