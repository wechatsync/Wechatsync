$syncer.addTask(
  {
    post: {
      title: 'hello world',
      content: 'abcde',
      thumb:
        'https://img.36krcdn.com/20201118/v2_38561aae819d4bb8b69efb6f0647a798_img_jpeg',
      desc: 'sample',
      link: 'https://www.wechatsync.com/',
    },
    accounts: temp1.accounts,
  },
  function(status) {
    console.log(status)
  }
)
