
var ResponseGenerator = (function(){

    // order from: 
    //      http://www.theguardian.com/news/datablog/2012/nov/06/time-states-election-results-us#data
    var dataSets = {
        "2012UsElection":[
            {"state": "in", "wonBy": "rep", "votes": 11},
            {"state": "ky", "wonBy": "rep", "votes": 8},
            {"state": "fl", "wonBy": "dem", "votes": 29},
            {"state": "ga", "wonBy": "rep", "votes": 16},
            {"state": "nh", "wonBy": "dem", "votes": 4},
            {"state": "sc", "wonBy": "rep", "votes": 9},
            {"state": "vt", "wonBy": "dem", "votes": 3},
            {"state": "va", "wonBy": "dem", "votes": 13},
            {"state": "nc", "wonBy": "rep", "votes": 15},
            {"state": "oh", "wonBy": "dem", "votes": 18},
            {"state": "wv", "wonBy": "rep", "votes": 5},
            {"state": "al", "wonBy": "rep", "votes": 9},
            {"state": "ct", "wonBy": "dem", "votes": 7},
            {"state": "de", "wonBy": "dem", "votes": 3},
            {"state": "dc", "wonBy": "dem", "votes": 3},
            {"state": "il", "wonBy": "dem", "votes": 20},
            {"state": "ks", "wonBy": "rep", "votes": 6},
            {"state": "me", "wonBy": "dem", "votes": 4},
            {"state": "md", "wonBy": "dem", "votes": 10},
            {"state": "ma", "wonBy": "dem", "votes": 11},
            {"state": "mi", "wonBy": "dem", "votes": 16},
            {"state": "ms", "wonBy": "rep", "votes": 6},
            {"state": "mo", "wonBy": "rep", "votes": 10},
            {"state": "nj", "wonBy": "dem", "votes": 14},
            {"state": "nd", "wonBy": "rep", "votes": 3},
            {"state": "ok", "wonBy": "rep", "votes": 7},
            {"state": "pa", "wonBy": "dem", "votes": 20},
            {"state": "ri", "wonBy": "dem", "votes": 4},
            {"state": "tn", "wonBy": "rep", "votes": 11},
            {"state": "tx", "wonBy": "rep", "votes": 38},
            {"state": "ar", "wonBy": "rep", "votes": 6},
            {"state": "co", "wonBy": "dem", "votes": 9},
            {"state": "la", "wonBy": "rep", "votes": 8},
            {"state": "mn", "wonBy": "dem", "votes": 10},
            {"state": "ne", "wonBy": "rep", "votes": 5},
            {"state": "nm", "wonBy": "dem", "votes": 5},
            {"state": "ny", "wonBy": "dem", "votes": 29},
            {"state": "sd", "wonBy": "rep", "votes": 3},
            {"state": "wi", "wonBy": "dem", "votes": 10},
            {"state": "wy", "wonBy": "rep", "votes": 3},
            {"state": "az", "wonBy": "rep", "votes": 11},
            {"state": "ia", "wonBy": "dem", "votes": 6},
            {"state": "mt", "wonBy": "rep", "votes": 3},
            {"state": "nv", "wonBy": "dem", "votes": 6},
            {"state": "ut", "wonBy": "rep", "votes": 6},
            {"state": "ca", "wonBy": "dem", "votes": 55},
            {"state": "hi", "wonBy": "dem", "votes": 4},
            {"state": "id", "wonBy": "rep", "votes": 4},
            {"state": "or", "wonBy": "dem", "votes": 7},
            {"state": "wa", "wonBy": "dem", "votes": 12},
            {"state": "ak", "wonBy": "rep", "votes": 3}
        ]
    };
    
    var ResponseGenerator = extend(Thing, function ResponseGenerator(options) {
        Thing.call(this, 'responseGenerator');

        this.timeBetweenPackets = Thing.asFunction(options.timeBetweenPackets);
        this.initialDelay = options.initialDelay;
        this.messageSize = options.messageSize;
        this.packetNumberAfter = options.packetSequence;
        this.packetMode = Thing.asFunction(options.packetMode);
    });
    
    ResponseGenerator.prototype.generateResponse = function(startingAt) {

        var self = this,
            firstPacketCreated = false;

        function packetNumbered(curPacketNumber) {
            // unannounced packet to use as a template for others
            var ordering = {
                i:       curPacketNumber,
                isFirst: !firstPacketCreated,
                isLast:  curPacketNumber >= (self.messageSize -1)
            };

            var packet = new Packet(
                'response' + curPacketNumber
                ,   'JSON'
                ,   'downstream'
                ,   ordering
                ,   self.packetMode(curPacketNumber)
            ).inDemo(self.demo);

            firstPacketCreated = true;

            return packet;
        }
        
        
        function sendNext(previousPacketNumber){
    
            var curPacketNumber = this.packetNumberAfter(previousPacketNumber),
                lastPacket = curPacketNumber >= (this.messageSize - 1);
    
            this.events('packetGenerated').emit(packetNumbered(curPacketNumber));

            if (!lastPacket) {
                var nextPacketNumber = this.packetNumberAfter(curPacketNumber);
                this.schedule(
                    sendNext.bind(this, curPacketNumber)
                    , this.timeBetweenPackets(nextPacketNumber)
                );
            }
        }
    
        this.schedule( sendNext.bind(this, startingAt -1), this.initialDelay );
    };
    
    return ResponseGenerator;
}());
