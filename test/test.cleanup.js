describe("cleanup", function() {
  it("removes all painted elements", function() {
    var strokes = document.getElementsByClassName("stroke");
    for(var i = strokes.length - 1; i >= 0; i--)
      strokes[i].removeFromDOM();
    localStorage.clear();
    expect(document.getElementsByClassName("stroke")).to.be.empty();
  });
});
