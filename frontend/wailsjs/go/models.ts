export namespace main {
	
	export class ExplorationEntry {
	    name: string;
	    path: string;
	    isDir: boolean;
	    size: string;
	    user: string;
	    group: string;
	    mode: string;
	    modified: string;
	
	    static createFrom(source: any = {}) {
	        return new ExplorationEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.isDir = source["isDir"];
	        this.size = source["size"];
	        this.user = source["user"];
	        this.group = source["group"];
	        this.mode = source["mode"];
	        this.modified = source["modified"];
	    }
	}
	export class Exploration {
	    entries: ExplorationEntry[];
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new Exploration(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.entries = this.convertValues(source["entries"], ExplorationEntry);
	        this.path = source["path"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class FileForUI {
	    key: string;
	    modified: string;
	    size: string;
	    user: string;
	    group: string;
	    mode: string;
	    data: number[];
	    isDir: boolean;
	    snapID: string;
	    volID: string;
	
	    static createFrom(source: any = {}) {
	        return new FileForUI(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.modified = source["modified"];
	        this.size = source["size"];
	        this.user = source["user"];
	        this.group = source["group"];
	        this.mode = source["mode"];
	        this.data = source["data"];
	        this.isDir = source["isDir"];
	        this.snapID = source["snapID"];
	        this.volID = source["volID"];
	    }
	}

}

