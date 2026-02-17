1.What is the difference between null and undefined?

Answer :ভেরিয়াবল ডিক্লিয়ার করে কোন মান সেট না করলে সেটা হয় undefined .
Example: const apple

কোন ভেরিয়েবলের মান ইচ্ছাকৃতভাবে null সেট করলে, null হয় ।
Example : let a = null

2.What is the use of the map() function in JavaScript? How is it different from forEach()?

Answer : map() কোন একটি Array আর সবগুলো elements এর উপর কাজ করে, নতুন একটা Array তৈরি করে ।

forEach() কোন একটি Array আর সবগুলো elements এর উপর কাজ করে কিন্তু নতুন একটা Array তৈরি করে না ।

পার্থক্য হল, নতুন Array তৈরি করে । নতুন Array তৈরি করে না ।

3.What is the difference between == and ===?

Answer : == শুধু মান কমপেয়ার করে । টাইপ আলাদা হলেও ।
=== টাইপ ও মান দুইটাই কম্পেয়ার করে । যেকোনো একটা আলাদা হলে, সমান দেখায় না ।


4.What is the significance of async/await in fetching API data?
Answer : async/await ব্যবহার করে API থেকে ডেটা আনা অনেক সহজ ও সুন্দর হয় ।
পরবর্তীতে কোড পড়তে সুবিধা হয় । কোড ডিবাগ করা সহজ হয় ।

5.Explain the concept of Scope in JavaScript (Global, Function, Block).
Answer : Scope হল কোডের কোন অংশ থেকে কোন ভেরিয়েবল ব্যবহার করা যাবে, তা নির্ধারণ করা ।
Global Scope : যে ভেরিয়েবল কল ফাংশন বা ব্লকের বাইরে ডিক্লিয়ার করা হয় ।
Function Scope: ফাংশনের ভেতর ডিক্লিয়ার করা ভেরিয়েবল । শুধু ফাংশানের ভেতরে ব্যবহার করা যায় ।
Block Scope : এগুলো Loop অথবা If/else এর ভেতর ব্যবহার করা হয় । {}- ব্র্যাকেটের বাইরে ব্যবহার করা যায় না ।
