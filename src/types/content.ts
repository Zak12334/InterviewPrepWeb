export type Option={id:string;label:string;feedback:string;complexity?:{time:string;space:string};correct:boolean};
export type Mcq={id:string;prompt:string;options:Option[]};
export type Hint={level:1|2|3|4;title:string;content:string;requiresConfirmation?:boolean};
export type Problem={slug:string;title:string;pattern:string;difficulty:'Easy'|'Medium'|'Hard';statement:string;constraints:string[];examples:{input:string;output:string;explanation:string}[];understanding:Mcq[];approach:Mcq[];planSteps:{id:string;text:string}[];hints:Hint[];starterCode:{python:string;java:string};testCases:{input:unknown[];expected:unknown}[];referenceSolutions:{python:string;java:string};relatedProblemUrl?:string};
export type TraceValue={type:'number'|'string'|'boolean'|'null'|'array'|'map'|'object';value:unknown};
export type TraceEvent={step:number;line:number;event:'line'|'call'|'return'|'exception'|'limit';function:string;locals:Record<string,TraceValue>;callStack:{function:string;line:number}[];structures:{kind:'array'|'map'|'stack'|'queue'|'linked-list'|'tree'|'graph'|'dp-table';variable:string;data:unknown;active?:string[];operation?:string}[];stdout:string;timestampMs:number};
