const fs = require('fs');           // pour lire/écrire des fichiers
const convert = require('xml-js');  // pour convertir JSON ↔ XML
const protobuf = require('protobufjs'); // pour manipuler Protobuf

// 1️⃣ Charger la définition Protobuf
const root = protobuf.loadSync('employee.proto');
const EmployeeList = root.lookupType('Employees');

// 2️⃣ Créer la liste d’employés avec champs supplémentaires
const employees = [
    { id: 1, name: 'Ali', salary: 9000, email: 'ali@mail.com', hireDate: '2022-01-15' },
    { id: 2, name: 'Kamal', salary: 22000, email: 'kamal@mail.com', hireDate: '2021-05-10' },
    { id: 3, name: 'Amal', salary: 23000, email: 'amal@mail.com', hireDate: '2020-09-20' }
];

const jsonObject = { employee: employees };

// Options pour XML
const xmlOptions = { compact: true, ignoreComment: true, spaces: 2 };

// ---------- JSON ----------
console.time('JSON encode');
const jsonData = JSON.stringify(jsonObject, null, 2);
console.timeEnd('JSON encode');

console.time('JSON decode');
const jsonDecoded = JSON.parse(jsonData);
console.timeEnd('JSON decode');

// ---------- XML ----------
console.time('XML encode');
const xmlData = "<root>\n" + convert.json2xml(jsonObject, xmlOptions) + "\n</root>";
console.timeEnd('XML encode');

console.time('XML decode');
const xmlJson = convert.xml2json(xmlData, { compact: true });
const xmlDecoded = JSON.parse(xmlJson);
console.timeEnd('XML decode');

// ---------- Protobuf ----------
console.time('Protobuf encode');
const errMsg = EmployeeList.verify(jsonObject);
if (errMsg) throw Error('Erreur de validation Protobuf : ' + errMsg);
const message = EmployeeList.create(jsonObject);
const buffer = EmployeeList.encode(message).finish();
console.timeEnd('Protobuf encode');

console.time('Protobuf decode');
const decodedMessage = EmployeeList.decode(buffer);
const protoDecoded = EmployeeList.toObject(decodedMessage);
console.timeEnd('Protobuf decode');

// ---------- Écriture des fichiers ----------
fs.writeFileSync('employees.json', jsonData);
fs.writeFileSync('employees.xml', xmlData);
fs.writeFileSync('employees.bin', buffer);

// Écriture des fichiers "data" pour comparaison
fs.writeFileSync('data.json', jsonData);   // JSON
fs.writeFileSync('data.xml', xmlData);     // XML
fs.writeFileSync('data.proto', buffer);    // Protobuf binaire

// ---------- Mesure des tailles ----------
const jsonFileSize = fs.statSync('data.json').size;
const xmlFileSize = fs.statSync('data.xml').size;
const protoFileSize = fs.statSync('data.proto').size;

console.log('Fichiers créés avec succès :');
console.log(`Taille de 'data.json' : ${jsonFileSize} octets`);
console.log(`Taille de 'data.xml'  : ${xmlFileSize} octets`);
console.log(`Taille de 'data.proto': ${protoFileSize} octets`);

// ---------- Vérification Protobuf : décodage ----------
console.log('Décodé depuis Protobuf :', protoDecoded);
