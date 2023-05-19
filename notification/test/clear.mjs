import COS from "cos-nodejs-sdk-v5";
const cos = new COS({
    SecretId: process.env.SecretId,
    SecretKey: process.env.SecretKey,
});
const config = { Bucket: process.env.Bucket, Region: process.env.Region };
var deleteFiles = function (marker) {
    cos.getBucket(
        {
            ...config,
            Prefix: "result-fonts/",
            Marker: marker,
            MaxKeys: 1000,
        },
        function (listError, listResult) {
            if (listError) return console.log("list error:", listError);
            var nextMarker = listResult.NextMarker;
            var objects = listResult.Contents.map(function (item) {
                return { Key: item.Key };
            });
            cos.deleteMultipleObject(
                {
                    ...config,
                    Objects: objects,
                },
                function (delError, deleteResult) {
                    if (delError) {
                        console.log("delete error", delError);
                        console.log("delete stop");
                    } else {
                        console.log("delete result", deleteResult);
                        if (listResult.IsTruncated === "true")
                            deleteFiles(nextMarker);
                        else console.log("delete complete");
                    }
                }
            );
        }
    );
};
deleteFiles();
