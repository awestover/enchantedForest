$.get("/leaderboard", (data)=>{
	for(let user in data){
		let pTag = $("<p>");
		pTag.text(`user: ${user}, level: ${data[user]}`);
		$("#leaderboard").append(pTag);
	}
});
