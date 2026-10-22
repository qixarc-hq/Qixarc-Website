import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const window={};vm.runInNewContext(fs.readFileSync(new URL('../dist/admin/security.js',import.meta.url),'utf8'),{window});
const security=window.QixarcSecurity;
const values={currentPassword:'fixture-current-123',newPassword:'fixture-new-passphrase-456',confirmation:'fixture-new-passphrase-456'};
function authStub(options={}){
 const calls=[];const user={id:'test-admin-id',email:'admin@example.test'};
 return {calls,auth:{
  async getUser(){calls.push('getUser');return options.expired?{data:{user:null},error:{}}:{data:{user},error:null};},
  async signInWithPassword(input){calls.push('verifyCurrent');assert.equal(input.email,user.email);assert.equal(input.password,values.currentPassword);return {data:{user},error:options.wrongPassword?{}:null};},
  async updateUser(input){calls.push('updatePassword');assert.equal(input.password,values.newPassword);assert.equal(input.current_password,values.currentPassword);return {error:options.updateError||null};},
  async signOut({scope}){calls.push('signOut:'+scope);return {error:options.signOutError?{}:null};}
 }};
}
let x=authStub();await assert.rejects(security.changePassword(x.auth,{...values,confirmation:'mismatch'},()=>true,()=>{}),/do not match/);assert.deepEqual(x.calls,[]);
assert.match(security.passwordError({...values,newPassword:'short'}),/12 and 128/);
assert.match(security.passwordError({...values,newPassword:'x'.repeat(129)}),/12 and 128/);
assert.match(security.passwordError({...values,newPassword:values.currentPassword,confirmation:values.currentPassword}),/different password/);
x=authStub({expired:true});await assert.rejects(security.changePassword(x.auth,values,()=>true,()=>{}),/session has ended/);assert.deepEqual(x.calls,['getUser']);
x=authStub();await assert.rejects(security.changePassword(x.auth,values,()=>false,()=>{}),/session has ended/);assert.deepEqual(x.calls,['getUser']);
x=authStub({wrongPassword:true});await assert.rejects(security.changePassword(x.auth,values,()=>true,()=>{}),/could not be verified/);assert.deepEqual(x.calls,['getUser','verifyCurrent']);
x=authStub();let membershipChecks=0;await assert.rejects(security.changePassword(x.auth,values,()=>++membershipChecks===1,()=>{}),/no longer has admin access/);assert.deepEqual(x.calls,['getUser','verifyCurrent']);
x=authStub({updateError:{code:'weak_password'}});await assert.rejects(security.changePassword(x.auth,values,()=>true,()=>{}),/stronger password/);assert.deepEqual(x.calls,['getUser','verifyCurrent','updatePassword']);
x=authStub();const result=await security.changePassword(x.auth,values,()=>true,()=>x.calls.push('lock'));assert.equal(result.sessionsRevoked,true);assert.deepEqual(x.calls,['getUser','verifyCurrent','updatePassword','lock','signOut:global']);
x=authStub({signOutError:true});assert.equal(await security.endSessions(x.auth,'others'),false);assert.deepEqual(x.calls,['signOut:others']);
x=authStub({signOutError:true});assert.equal(await security.endSessions(x.auth,'global'),false);assert.deepEqual(x.calls,['signOut:global','signOut:local']);
await assert.rejects(security.endSessions(x.auth,'invalid'),/Invalid session scope/);
console.log('PASS: validation, expired/non-admin denial, current-password verification, revoked membership, password failure, session scopes and failure handling. No live credentials or accounts used.');
